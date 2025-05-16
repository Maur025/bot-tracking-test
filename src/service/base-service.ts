import { FilterQuery, Model, PaginateModel, PaginateResult } from 'mongoose';
import { BaseDocument } from '../models/interface/base-document';

export abstract class BaseService<T extends BaseDocument> {
	protected abstract serviceModel(): Model<T>;

	public async save(data: Partial<T>): Promise<T> {
		const model = this.serviceModel();

		const document = new model(data);

		return document.save();
	}

	public async update(id: string, data: Partial<T>): Promise<T | null> {
		return this.serviceModel()
			.findByIdAndUpdate(id, data, { new: true })
			.exec();
	}

	public async saveAll(dataList: T[]): Promise<void> {
		await this.serviceModel().insertMany(dataList);
	}

	public async existsById(id: string): Promise<boolean> {
		return this.serviceModel()
			.exists({ _id: id })
			.then(result => !!result);
	}

	public async findById(id: string): Promise<T | null> {
		return this.serviceModel().findById(id).exec();
	}

	public async findByIdThrow(id: string): Promise<T> {
		const data = await this.findById(id);

		if (!data) {
			throw new Error(`Data with id ${id} not found.`);
		}

		return data;
	}

	public async findAll(): Promise<T[]> {
		return this.serviceModel().find().exec();
	}

	public async findAllById(idList: string[]): Promise<T[]> {
		return this.serviceModel()
			.find({ _id: { $in: idList } })
			.exec();
	}

	public async findAllPag(
		query: FilterQuery<T>,
		paginate?: {
			page: number;
			limit: number;
		}
	): Promise<PaginateResult<T>> {
		const paginateService = this.serviceModel() as PaginateModel<T>;
		return paginateService.paginate(query, paginate);
	}

	public async count(): Promise<number> {
		return this.serviceModel().countDocuments().exec();
	}

	public async deleteById(id: string): Promise<void> {
		await this.serviceModel().findByIdAndDelete(id).exec();
	}

	public async delete(data: T): Promise<void> {}

	public async deleteAllById(idList: string[]): Promise<void> {}

	public async deleteAll(dataList: T[]): Promise<void> {}
}
