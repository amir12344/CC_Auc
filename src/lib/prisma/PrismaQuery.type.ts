import { Prisma } from "../../../amplify/functions/lambda-layers/core-layer/nodejs/prisma/generated/client";

export type ModelName = Prisma.ModelName;
export type PrismaModelType<N extends ModelName = ModelName> =
  Prisma.TypeMap["model"][N];
export type FindManyArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["findMany"]["args"];
export type FindManyResult<N extends ModelName> =
  PrismaModelType<N>["operations"]["findMany"]["result"];
export type FindUniqueArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["findUnique"]["args"];
export type FindUniqueResult<N extends ModelName> =
  PrismaModelType<N>["operations"]["findUnique"]["result"];
export type FindUniqueOrThrowResult<N extends ModelName> =
  PrismaModelType<N>["operations"]["findUniqueOrThrow"]["result"];
export type CountArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["count"]["args"];
export type CountResult<N extends ModelName> =
  PrismaModelType<N>["operations"]["count"]["result"];
export type CreateArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["create"]["args"];
export type CreateManyArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["createMany"]["args"];
export type AggregateArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["aggregate"]["args"];
export type GroupByArgs<N extends ModelName> =
  PrismaModelType<N>["operations"]["groupBy"]["args"];

export type WhereInput<N extends ModelName = ModelName> = NonNullable<
  FindManyArgs<N>["where"]
>;
export type SelectInput<N extends ModelName = ModelName> = NonNullable<
  FindManyArgs<N>["select"]
>;
export type WhereAnd<N extends ModelName = ModelName> = NonNullable<
  WhereInput<N>["AND"]
>;
export type WhereOr<N extends ModelName = ModelName> = NonNullable<
  WhereInput<N>["OR"]
>;
export type WhereUniqueInput<N extends ModelName = ModelName> = NonNullable<
  FindUniqueArgs<N>["where"]
>;
