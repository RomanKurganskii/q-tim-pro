import { BadGatewayException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
	constructor(private readonly dataSource: DataSource) {}

	async checkAppStatus(): Promise<{
		appStatus: string;
		dbStatus: 'ok' | 'error';
	}> {
		const dbStatus = await this.checkDBStatus();

		if (dbStatus === 'error') {
			throw new BadGatewayException(`dbStatus - ${dbStatus}`);
		}
		return {
			appStatus: 'ok',
			dbStatus,
		};
	}

	private async checkDBStatus(): Promise<'ok' | 'error'> {
		try {
			await this.dataSource.query('SELECT 1');
			return 'ok';
		} catch {
			return 'error';
		}
	}
}
