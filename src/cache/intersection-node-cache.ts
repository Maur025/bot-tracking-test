import { loggerDebug } from '@maur025/core-logger';
import { AvailableNode } from '@models/data/available-node';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import { graphWayIntersectionService } from '@services/database/graph-way-intersection-service';
import { Position } from 'geojson';
import KDBush from 'kdbush';
import { PaginateResult } from 'mongoose';

class IntersectionNodeCache {
	private readonly intersectionNodeMap: Map<string, Partial<AvailableNode>> =
		new Map();

	private indexedNodes: KDBush | null = null;

	public readonly initialize = async (): Promise<void> => {
		const nodeQuantity = await graphWayIntersectionService.count();

		if (this.intersectionNodeMap.size || this.indexedNodes) {
			this.intersectionNodeMap.clear();
			this.indexedNodes = null;
		}

		this.indexedNodes = new KDBush(nodeQuantity);

		let hasMore: boolean = true;
		let page: number = 1;
		const limit: number = 1000;

		while (hasMore) {
			const resultGraphIntersections: PaginateResult<IGraphWayIntersection> =
				await graphWayIntersectionService.findAllPag({}, { page, limit });

			for (const graphIntersection of resultGraphIntersections.docs) {
				const nodeCoords: Position = graphIntersection.coord.coordinates;

				this.intersectionNodeMap.set(graphIntersection.nodeId, {
					nodeId: graphIntersection.nodeId,
					coord: {
						type: 'Point',
						coordinates: nodeCoords,
					},
					connections: [...graphIntersection.connections],
				});

				this.indexedNodes.add(nodeCoords[0], nodeCoords[1]);
			}

			page++;
			hasMore = resultGraphIntersections.hasNextPage;
		}

		this.indexedNodes.finish();
		loggerDebug(
			`cache intersections nodes loaded sucessfully with ${this.intersectionNodeMap.size}`
		);
	};

	public readonly getNodes = (): Map<string, Partial<AvailableNode>> =>
		this.intersectionNodeMap;

	public readonly getIndexedNodes = (): any => {
		if (!this.indexedNodes) {
			throw new Error('indexed Nodes not initalized');
		}

		return this.indexedNodes;
	};
}

export const intersectionNodeCache = new IntersectionNodeCache();
