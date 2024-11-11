import type { Context } from "./context";
import type { Service, ServiceVersion } from "./service";

export type ServiceSchemaLifecycleHandler<TThis> = (this: TThis) => Promise<void>;

export interface ServiceSchemaInternalSettings {
	$dependencyTimeout?: number;
	$shutdownTimeout?: number;
	$secureSettings?: string[];
}

export interface ServiceDependencyItem {
	name: string;
	version?: string | number;
}

type ServiceThis<
	TSettings extends Record<string, unknown>,
	TMetadata extends Record<string, unknown>,
	TMethods,
> = TMethods & Service<TSettings, TMetadata>;

export type ServiceDependencies =
	| string
	| ServiceDependencyItem
	| (string | ServiceDependencyItem)[];

interface TParamTypes {
	string: string;
	number: number;
	boolean: boolean;
}
type ParamTypes = keyof TParamTypes;

type ExtractParam<TParam extends ParamTypes | ParameterObject> = TParam extends ParameterObject
	? TParam["type"]
	: TParam;

type ParamType<TParam extends ParamTypes | ParameterObject> =
	ExtractParam<TParam> extends "string"
		? string
		: ExtractParam<TParam> extends "number"
			? number
			: never;

type ActionParamType<TParams extends ParameterSchema> = {
	[key in keyof TParams]: ParamType<TParams[key]>;
};

export type ActionHandler<TParams extends ParameterSchema = ParameterSchema> = (
	ctx: Context<ActionParamType<TParams>>,
) => unknown;

export interface ActionDefinition<TParams extends ParameterSchema = ParameterSchema> {
	name?: string;
	params?: TParams;
	skipHandler?: boolean;
	handler?: ActionHandler<TParams>;
}

interface ParameterObject {
	type: ParamTypes;
}

export type ParameterSchema = Record<string, ParamTypes | ParameterObject>;

export type ServiceSyncLifecycleFunction<
	TSettings extends Record<string, unknown>,
	TMetadata extends Record<string, unknown>,
	TMethods,
> = (this: ServiceThis<TSettings, TMetadata, TMethods>) => void;

export type ServiceASyncLifecycleFunction<
	TSettings extends Record<string, unknown>,
	TMetadata extends Record<string, unknown>,
	TMethods,
> = (this: ServiceThis<TSettings, TMetadata, TMethods>) => Promise<void>;

export interface ServiceSchema<
	TSettings extends Record<string, unknown>,
	TMetadata extends Record<string, unknown>,
	TMethods extends Record<string, unknown> = Record<string, unknown>,
	TThis = ServiceThis<TSettings, TMetadata, TMethods>,
> {
	name: string;
	version?: ServiceVersion;
	settings?: TSettings;
	metadata?: TMetadata;
	dependencies?: ServiceDependencies;
	actions?: Record<string, ActionDefinition | ActionHandler> & ThisType<TThis>;
	// events?: Record<string, unknown>;
	methods?: TMethods & ThisType<TThis>;

	merged?:
		| ServiceSyncLifecycleFunction<TSettings, TMetadata, TMethods>
		| ServiceSyncLifecycleFunction<TSettings, TMetadata, TMethods>[];
	created?:
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>[];
	started?:
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>[];
	stopped?:
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>
		| ServiceASyncLifecycleFunction<TSettings, TMetadata, TMethods>[];
}
