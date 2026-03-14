import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import 'dotenv/config';
import { ALL_ENTITES } from './data-source-entities.const';
import { ENV } from '../common/consts/env';

const options: DataSourceOptions & SeederOptions = {
	type: 'postgres',
	host: process.env[ENV.POSTGRES_HOST],
	port: Number(process.env[ENV.POSTGRES_PORT]),
	username: process.env[ENV.POSTGRES_USER],
	password: process.env[ENV.POSTGRES_PASSWORD],
	database: process.env[ENV.POSTGRES_DB],
	migrations: [__dirname + '/migrations/*.ts'],
	entities: ALL_ENTITES,
	factories: [],
	seeds: [],
};

export const dataSource = new DataSource(options);
