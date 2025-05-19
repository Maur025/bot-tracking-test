import { createBotDevices } from './create-bot-devices';
import { deviceService } from './device-service';

export const generateBotDevice = async (quantity: number): Promise<void> => {
	const registeredDevices: number = await deviceService.count();
	const quantityDevicesCreate: number = quantity - registeredDevices;

	if (quantityDevicesCreate > 0) {
		await createBotDevices(quantityDevicesCreate);
	}
};
