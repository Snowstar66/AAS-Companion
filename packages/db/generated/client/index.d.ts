
/**
 * Client
**/

import * as runtime from '@prisma/client/runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model AppUser
 * 
 */
export type AppUser = $Result.DefaultSelection<Prisma.$AppUserPayload>
/**
 * Model Membership
 * 
 */
export type Membership = $Result.DefaultSelection<Prisma.$MembershipPayload>
/**
 * Model Outcome
 * 
 */
export type Outcome = $Result.DefaultSelection<Prisma.$OutcomePayload>
/**
 * Model Epic
 * 
 */
export type Epic = $Result.DefaultSelection<Prisma.$EpicPayload>
/**
 * Model Story
 * 
 */
export type Story = $Result.DefaultSelection<Prisma.$StoryPayload>
/**
 * Model Tollgate
 * 
 */
export type Tollgate = $Result.DefaultSelection<Prisma.$TollgatePayload>
/**
 * Model ActivityEvent
 * 
 */
export type ActivityEvent = $Result.DefaultSelection<Prisma.$ActivityEventPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MembershipRole: {
  value_owner: 'value_owner',
  aida: 'aida',
  aqa: 'aqa',
  architect: 'architect',
  delivery_lead: 'delivery_lead',
  builder: 'builder'
};

export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole]


export const OutcomeStatus: {
  draft: 'draft',
  baseline_in_progress: 'baseline_in_progress',
  ready_for_tg1: 'ready_for_tg1',
  active: 'active'
};

export type OutcomeStatus = (typeof OutcomeStatus)[keyof typeof OutcomeStatus]


export const EpicStatus: {
  draft: 'draft',
  in_progress: 'in_progress',
  completed: 'completed'
};

export type EpicStatus = (typeof EpicStatus)[keyof typeof EpicStatus]


export const StoryType: {
  outcome_delivery: 'outcome_delivery',
  governance: 'governance',
  enablement: 'enablement'
};

export type StoryType = (typeof StoryType)[keyof typeof StoryType]


export const StoryStatus: {
  draft: 'draft',
  definition_blocked: 'definition_blocked',
  ready_for_handoff: 'ready_for_handoff',
  in_progress: 'in_progress'
};

export type StoryStatus = (typeof StoryStatus)[keyof typeof StoryStatus]


export const TollgateEntityType: {
  outcome: 'outcome',
  story: 'story'
};

export type TollgateEntityType = (typeof TollgateEntityType)[keyof typeof TollgateEntityType]


export const TollgateType: {
  tg1_baseline: 'tg1_baseline',
  story_readiness: 'story_readiness'
};

export type TollgateType = (typeof TollgateType)[keyof typeof TollgateType]


export const TollgateStatus: {
  blocked: 'blocked',
  ready: 'ready',
  approved: 'approved'
};

export type TollgateStatus = (typeof TollgateStatus)[keyof typeof TollgateStatus]


export const ActivityEntityType: {
  organization: 'organization',
  outcome: 'outcome',
  epic: 'epic',
  story: 'story',
  tollgate: 'tollgate'
};

export type ActivityEntityType = (typeof ActivityEntityType)[keyof typeof ActivityEntityType]


export const ActivityEventType: {
  demo_seeded: 'demo_seeded',
  outcome_created: 'outcome_created',
  outcome_updated: 'outcome_updated',
  story_created: 'story_created',
  story_updated: 'story_updated',
  tollgate_recorded: 'tollgate_recorded',
  execution_contract_generated: 'execution_contract_generated'
};

export type ActivityEventType = (typeof ActivityEventType)[keyof typeof ActivityEventType]


export const RiskProfile: {
  low: 'low',
  medium: 'medium',
  high: 'high'
};

export type RiskProfile = (typeof RiskProfile)[keyof typeof RiskProfile]


export const AiAccelerationLevel: {
  level_2: 'level_2'
};

export type AiAccelerationLevel = (typeof AiAccelerationLevel)[keyof typeof AiAccelerationLevel]

}

export type MembershipRole = $Enums.MembershipRole

export const MembershipRole: typeof $Enums.MembershipRole

export type OutcomeStatus = $Enums.OutcomeStatus

export const OutcomeStatus: typeof $Enums.OutcomeStatus

export type EpicStatus = $Enums.EpicStatus

export const EpicStatus: typeof $Enums.EpicStatus

export type StoryType = $Enums.StoryType

export const StoryType: typeof $Enums.StoryType

export type StoryStatus = $Enums.StoryStatus

export const StoryStatus: typeof $Enums.StoryStatus

export type TollgateEntityType = $Enums.TollgateEntityType

export const TollgateEntityType: typeof $Enums.TollgateEntityType

export type TollgateType = $Enums.TollgateType

export const TollgateType: typeof $Enums.TollgateType

export type TollgateStatus = $Enums.TollgateStatus

export const TollgateStatus: typeof $Enums.TollgateStatus

export type ActivityEntityType = $Enums.ActivityEntityType

export const ActivityEntityType: typeof $Enums.ActivityEntityType

export type ActivityEventType = $Enums.ActivityEventType

export const ActivityEventType: typeof $Enums.ActivityEventType

export type RiskProfile = $Enums.RiskProfile

export const RiskProfile: typeof $Enums.RiskProfile

export type AiAccelerationLevel = $Enums.AiAccelerationLevel

export const AiAccelerationLevel: typeof $Enums.AiAccelerationLevel

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Organizations
 * const organizations = await prisma.organization.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Organizations
   * const organizations = await prisma.organization.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appUser`: Exposes CRUD operations for the **AppUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppUsers
    * const appUsers = await prisma.appUser.findMany()
    * ```
    */
  get appUser(): Prisma.AppUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.membership`: Exposes CRUD operations for the **Membership** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Memberships
    * const memberships = await prisma.membership.findMany()
    * ```
    */
  get membership(): Prisma.MembershipDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outcome`: Exposes CRUD operations for the **Outcome** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outcomes
    * const outcomes = await prisma.outcome.findMany()
    * ```
    */
  get outcome(): Prisma.OutcomeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.epic`: Exposes CRUD operations for the **Epic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Epics
    * const epics = await prisma.epic.findMany()
    * ```
    */
  get epic(): Prisma.EpicDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.story`: Exposes CRUD operations for the **Story** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stories
    * const stories = await prisma.story.findMany()
    * ```
    */
  get story(): Prisma.StoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tollgate`: Exposes CRUD operations for the **Tollgate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tollgates
    * const tollgates = await prisma.tollgate.findMany()
    * ```
    */
  get tollgate(): Prisma.TollgateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activityEvent`: Exposes CRUD operations for the **ActivityEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivityEvents
    * const activityEvents = await prisma.activityEvent.findMany()
    * ```
    */
  get activityEvent(): Prisma.ActivityEventDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Organization: 'Organization',
    AppUser: 'AppUser',
    Membership: 'Membership',
    Outcome: 'Outcome',
    Epic: 'Epic',
    Story: 'Story',
    Tollgate: 'Tollgate',
    ActivityEvent: 'ActivityEvent'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "organization" | "appUser" | "membership" | "outcome" | "epic" | "story" | "tollgate" | "activityEvent"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      AppUser: {
        payload: Prisma.$AppUserPayload<ExtArgs>
        fields: Prisma.AppUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findFirst: {
            args: Prisma.AppUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findMany: {
            args: Prisma.AppUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          create: {
            args: Prisma.AppUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          createMany: {
            args: Prisma.AppUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          delete: {
            args: Prisma.AppUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          update: {
            args: Prisma.AppUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          deleteMany: {
            args: Prisma.AppUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          upsert: {
            args: Prisma.AppUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          aggregate: {
            args: Prisma.AppUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppUser>
          }
          groupBy: {
            args: Prisma.AppUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppUserCountArgs<ExtArgs>
            result: $Utils.Optional<AppUserCountAggregateOutputType> | number
          }
        }
      }
      Membership: {
        payload: Prisma.$MembershipPayload<ExtArgs>
        fields: Prisma.MembershipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MembershipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MembershipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          findFirst: {
            args: Prisma.MembershipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MembershipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          findMany: {
            args: Prisma.MembershipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>[]
          }
          create: {
            args: Prisma.MembershipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          createMany: {
            args: Prisma.MembershipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MembershipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>[]
          }
          delete: {
            args: Prisma.MembershipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          update: {
            args: Prisma.MembershipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          deleteMany: {
            args: Prisma.MembershipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MembershipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MembershipUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>[]
          }
          upsert: {
            args: Prisma.MembershipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPayload>
          }
          aggregate: {
            args: Prisma.MembershipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMembership>
          }
          groupBy: {
            args: Prisma.MembershipGroupByArgs<ExtArgs>
            result: $Utils.Optional<MembershipGroupByOutputType>[]
          }
          count: {
            args: Prisma.MembershipCountArgs<ExtArgs>
            result: $Utils.Optional<MembershipCountAggregateOutputType> | number
          }
        }
      }
      Outcome: {
        payload: Prisma.$OutcomePayload<ExtArgs>
        fields: Prisma.OutcomeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutcomeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutcomeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          findFirst: {
            args: Prisma.OutcomeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutcomeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          findMany: {
            args: Prisma.OutcomeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>[]
          }
          create: {
            args: Prisma.OutcomeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          createMany: {
            args: Prisma.OutcomeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutcomeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>[]
          }
          delete: {
            args: Prisma.OutcomeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          update: {
            args: Prisma.OutcomeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          deleteMany: {
            args: Prisma.OutcomeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutcomeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutcomeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>[]
          }
          upsert: {
            args: Prisma.OutcomeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutcomePayload>
          }
          aggregate: {
            args: Prisma.OutcomeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutcome>
          }
          groupBy: {
            args: Prisma.OutcomeGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutcomeGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutcomeCountArgs<ExtArgs>
            result: $Utils.Optional<OutcomeCountAggregateOutputType> | number
          }
        }
      }
      Epic: {
        payload: Prisma.$EpicPayload<ExtArgs>
        fields: Prisma.EpicFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EpicFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EpicFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          findFirst: {
            args: Prisma.EpicFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EpicFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          findMany: {
            args: Prisma.EpicFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>[]
          }
          create: {
            args: Prisma.EpicCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          createMany: {
            args: Prisma.EpicCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EpicCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>[]
          }
          delete: {
            args: Prisma.EpicDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          update: {
            args: Prisma.EpicUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          deleteMany: {
            args: Prisma.EpicDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EpicUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EpicUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>[]
          }
          upsert: {
            args: Prisma.EpicUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EpicPayload>
          }
          aggregate: {
            args: Prisma.EpicAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEpic>
          }
          groupBy: {
            args: Prisma.EpicGroupByArgs<ExtArgs>
            result: $Utils.Optional<EpicGroupByOutputType>[]
          }
          count: {
            args: Prisma.EpicCountArgs<ExtArgs>
            result: $Utils.Optional<EpicCountAggregateOutputType> | number
          }
        }
      }
      Story: {
        payload: Prisma.$StoryPayload<ExtArgs>
        fields: Prisma.StoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          findFirst: {
            args: Prisma.StoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          findMany: {
            args: Prisma.StoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>[]
          }
          create: {
            args: Prisma.StoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          createMany: {
            args: Prisma.StoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>[]
          }
          delete: {
            args: Prisma.StoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          update: {
            args: Prisma.StoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          deleteMany: {
            args: Prisma.StoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>[]
          }
          upsert: {
            args: Prisma.StoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoryPayload>
          }
          aggregate: {
            args: Prisma.StoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStory>
          }
          groupBy: {
            args: Prisma.StoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<StoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.StoryCountArgs<ExtArgs>
            result: $Utils.Optional<StoryCountAggregateOutputType> | number
          }
        }
      }
      Tollgate: {
        payload: Prisma.$TollgatePayload<ExtArgs>
        fields: Prisma.TollgateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TollgateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TollgateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          findFirst: {
            args: Prisma.TollgateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TollgateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          findMany: {
            args: Prisma.TollgateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>[]
          }
          create: {
            args: Prisma.TollgateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          createMany: {
            args: Prisma.TollgateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TollgateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>[]
          }
          delete: {
            args: Prisma.TollgateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          update: {
            args: Prisma.TollgateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          deleteMany: {
            args: Prisma.TollgateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TollgateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TollgateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>[]
          }
          upsert: {
            args: Prisma.TollgateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TollgatePayload>
          }
          aggregate: {
            args: Prisma.TollgateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTollgate>
          }
          groupBy: {
            args: Prisma.TollgateGroupByArgs<ExtArgs>
            result: $Utils.Optional<TollgateGroupByOutputType>[]
          }
          count: {
            args: Prisma.TollgateCountArgs<ExtArgs>
            result: $Utils.Optional<TollgateCountAggregateOutputType> | number
          }
        }
      }
      ActivityEvent: {
        payload: Prisma.$ActivityEventPayload<ExtArgs>
        fields: Prisma.ActivityEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          findFirst: {
            args: Prisma.ActivityEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          findMany: {
            args: Prisma.ActivityEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>[]
          }
          create: {
            args: Prisma.ActivityEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          createMany: {
            args: Prisma.ActivityEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivityEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>[]
          }
          delete: {
            args: Prisma.ActivityEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          update: {
            args: Prisma.ActivityEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          deleteMany: {
            args: Prisma.ActivityEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivityEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>[]
          }
          upsert: {
            args: Prisma.ActivityEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityEventPayload>
          }
          aggregate: {
            args: Prisma.ActivityEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivityEvent>
          }
          groupBy: {
            args: Prisma.ActivityEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityEventCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityEventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    organization?: OrganizationOmit
    appUser?: AppUserOmit
    membership?: MembershipOmit
    outcome?: OutcomeOmit
    epic?: EpicOmit
    story?: StoryOmit
    tollgate?: TollgateOmit
    activityEvent?: ActivityEventOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    memberships: number
    outcomes: number
    epics: number
    stories: number
    tollgates: number
    activityEvents: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | OrganizationCountOutputTypeCountMembershipsArgs
    outcomes?: boolean | OrganizationCountOutputTypeCountOutcomesArgs
    epics?: boolean | OrganizationCountOutputTypeCountEpicsArgs
    stories?: boolean | OrganizationCountOutputTypeCountStoriesArgs
    tollgates?: boolean | OrganizationCountOutputTypeCountTollgatesArgs
    activityEvents?: boolean | OrganizationCountOutputTypeCountActivityEventsArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountOutcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountEpicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpicWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountStoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoryWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountTollgatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TollgateWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountActivityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityEventWhereInput
  }


  /**
   * Count Type AppUserCountOutputType
   */

  export type AppUserCountOutputType = {
    memberships: number
    ownedOutcomes: number
    tollgateDecisions: number
    activityEvents: number
  }

  export type AppUserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | AppUserCountOutputTypeCountMembershipsArgs
    ownedOutcomes?: boolean | AppUserCountOutputTypeCountOwnedOutcomesArgs
    tollgateDecisions?: boolean | AppUserCountOutputTypeCountTollgateDecisionsArgs
    activityEvents?: boolean | AppUserCountOutputTypeCountActivityEventsArgs
  }

  // Custom InputTypes
  /**
   * AppUserCountOutputType without action
   */
  export type AppUserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUserCountOutputType
     */
    select?: AppUserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AppUserCountOutputType without action
   */
  export type AppUserCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipWhereInput
  }

  /**
   * AppUserCountOutputType without action
   */
  export type AppUserCountOutputTypeCountOwnedOutcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeWhereInput
  }

  /**
   * AppUserCountOutputType without action
   */
  export type AppUserCountOutputTypeCountTollgateDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TollgateWhereInput
  }

  /**
   * AppUserCountOutputType without action
   */
  export type AppUserCountOutputTypeCountActivityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityEventWhereInput
  }


  /**
   * Count Type OutcomeCountOutputType
   */

  export type OutcomeCountOutputType = {
    epics: number
    stories: number
  }

  export type OutcomeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    epics?: boolean | OutcomeCountOutputTypeCountEpicsArgs
    stories?: boolean | OutcomeCountOutputTypeCountStoriesArgs
  }

  // Custom InputTypes
  /**
   * OutcomeCountOutputType without action
   */
  export type OutcomeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutcomeCountOutputType
     */
    select?: OutcomeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OutcomeCountOutputType without action
   */
  export type OutcomeCountOutputTypeCountEpicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpicWhereInput
  }

  /**
   * OutcomeCountOutputType without action
   */
  export type OutcomeCountOutputTypeCountStoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoryWhereInput
  }


  /**
   * Count Type EpicCountOutputType
   */

  export type EpicCountOutputType = {
    stories: number
  }

  export type EpicCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stories?: boolean | EpicCountOutputTypeCountStoriesArgs
  }

  // Custom InputTypes
  /**
   * EpicCountOutputType without action
   */
  export type EpicCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EpicCountOutputType
     */
    select?: EpicCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EpicCountOutputType without action
   */
  export type EpicCountOutputTypeCountStoriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    slug: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    slug: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    slug?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    slug: string
    name: string
    createdAt: Date
    updatedAt: Date
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    memberships?: boolean | Organization$membershipsArgs<ExtArgs>
    outcomes?: boolean | Organization$outcomesArgs<ExtArgs>
    epics?: boolean | Organization$epicsArgs<ExtArgs>
    stories?: boolean | Organization$storiesArgs<ExtArgs>
    tollgates?: boolean | Organization$tollgatesArgs<ExtArgs>
    activityEvents?: boolean | Organization$activityEventsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slug?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    slug?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slug" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | Organization$membershipsArgs<ExtArgs>
    outcomes?: boolean | Organization$outcomesArgs<ExtArgs>
    epics?: boolean | Organization$epicsArgs<ExtArgs>
    stories?: boolean | Organization$storiesArgs<ExtArgs>
    tollgates?: boolean | Organization$tollgatesArgs<ExtArgs>
    activityEvents?: boolean | Organization$activityEventsArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      memberships: Prisma.$MembershipPayload<ExtArgs>[]
      outcomes: Prisma.$OutcomePayload<ExtArgs>[]
      epics: Prisma.$EpicPayload<ExtArgs>[]
      stories: Prisma.$StoryPayload<ExtArgs>[]
      tollgates: Prisma.$TollgatePayload<ExtArgs>[]
      activityEvents: Prisma.$ActivityEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slug: string
      name: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memberships<T extends Organization$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outcomes<T extends Organization$outcomesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$outcomesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    epics<T extends Organization$epicsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$epicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    stories<T extends Organization$storiesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$storiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tollgates<T extends Organization$tollgatesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$tollgatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    activityEvents<T extends Organization$activityEventsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$activityEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly slug: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.memberships
   */
  export type Organization$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    where?: MembershipWhereInput
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    cursor?: MembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MembershipScalarFieldEnum | MembershipScalarFieldEnum[]
  }

  /**
   * Organization.outcomes
   */
  export type Organization$outcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    where?: OutcomeWhereInput
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    cursor?: OutcomeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutcomeScalarFieldEnum | OutcomeScalarFieldEnum[]
  }

  /**
   * Organization.epics
   */
  export type Organization$epicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    where?: EpicWhereInput
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    cursor?: EpicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Organization.stories
   */
  export type Organization$storiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    where?: StoryWhereInput
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    cursor?: StoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Organization.tollgates
   */
  export type Organization$tollgatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    where?: TollgateWhereInput
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    cursor?: TollgateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TollgateScalarFieldEnum | TollgateScalarFieldEnum[]
  }

  /**
   * Organization.activityEvents
   */
  export type Organization$activityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    where?: ActivityEventWhereInput
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    cursor?: ActivityEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivityEventScalarFieldEnum | ActivityEventScalarFieldEnum[]
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model AppUser
   */

  export type AggregateAppUser = {
    _count: AppUserCountAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  export type AppUserMinAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppUserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    fullName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppUserCountAggregateOutputType = {
    id: number
    email: number
    fullName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AppUserMinAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppUserMaxAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppUserCountAggregateInputType = {
    id?: true
    email?: true
    fullName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AppUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUser to aggregate.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppUsers
    **/
    _count?: true | AppUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppUserMaxAggregateInputType
  }

  export type GetAppUserAggregateType<T extends AppUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAppUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppUser[P]>
      : GetScalarType<T[P], AggregateAppUser[P]>
  }




  export type AppUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppUserWhereInput
    orderBy?: AppUserOrderByWithAggregationInput | AppUserOrderByWithAggregationInput[]
    by: AppUserScalarFieldEnum[] | AppUserScalarFieldEnum
    having?: AppUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppUserCountAggregateInputType | true
    _min?: AppUserMinAggregateInputType
    _max?: AppUserMaxAggregateInputType
  }

  export type AppUserGroupByOutputType = {
    id: string
    email: string
    fullName: string | null
    createdAt: Date
    updatedAt: Date
    _count: AppUserCountAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  type GetAppUserGroupByPayload<T extends AppUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppUserGroupByOutputType[P]>
            : GetScalarType<T[P], AppUserGroupByOutputType[P]>
        }
      >
    >


  export type AppUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    memberships?: boolean | AppUser$membershipsArgs<ExtArgs>
    ownedOutcomes?: boolean | AppUser$ownedOutcomesArgs<ExtArgs>
    tollgateDecisions?: boolean | AppUser$tollgateDecisionsArgs<ExtArgs>
    activityEvents?: boolean | AppUser$activityEventsArgs<ExtArgs>
    _count?: boolean | AppUserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    fullName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectScalar = {
    id?: boolean
    email?: boolean
    fullName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AppUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "fullName" | "createdAt" | "updatedAt", ExtArgs["result"]["appUser"]>
  export type AppUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | AppUser$membershipsArgs<ExtArgs>
    ownedOutcomes?: boolean | AppUser$ownedOutcomesArgs<ExtArgs>
    tollgateDecisions?: boolean | AppUser$tollgateDecisionsArgs<ExtArgs>
    activityEvents?: boolean | AppUser$activityEventsArgs<ExtArgs>
    _count?: boolean | AppUserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AppUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AppUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AppUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppUser"
    objects: {
      memberships: Prisma.$MembershipPayload<ExtArgs>[]
      ownedOutcomes: Prisma.$OutcomePayload<ExtArgs>[]
      tollgateDecisions: Prisma.$TollgatePayload<ExtArgs>[]
      activityEvents: Prisma.$ActivityEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      fullName: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["appUser"]>
    composites: {}
  }

  type AppUserGetPayload<S extends boolean | null | undefined | AppUserDefaultArgs> = $Result.GetResult<Prisma.$AppUserPayload, S>

  type AppUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppUserCountAggregateInputType | true
    }

  export interface AppUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppUser'], meta: { name: 'AppUser' } }
    /**
     * Find zero or one AppUser that matches the filter.
     * @param {AppUserFindUniqueArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppUserFindUniqueArgs>(args: SelectSubset<T, AppUserFindUniqueArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AppUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppUserFindUniqueOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AppUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppUserFindFirstArgs>(args?: SelectSubset<T, AppUserFindFirstArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AppUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AppUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppUsers
     * const appUsers = await prisma.appUser.findMany()
     * 
     * // Get first 10 AppUsers
     * const appUsers = await prisma.appUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appUserWithIdOnly = await prisma.appUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AppUserFindManyArgs>(args?: SelectSubset<T, AppUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AppUser.
     * @param {AppUserCreateArgs} args - Arguments to create a AppUser.
     * @example
     * // Create one AppUser
     * const AppUser = await prisma.appUser.create({
     *   data: {
     *     // ... data to create a AppUser
     *   }
     * })
     * 
     */
    create<T extends AppUserCreateArgs>(args: SelectSubset<T, AppUserCreateArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AppUsers.
     * @param {AppUserCreateManyArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppUserCreateManyArgs>(args?: SelectSubset<T, AppUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppUsers and returns the data saved in the database.
     * @param {AppUserCreateManyAndReturnArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppUsers and only return the `id`
     * const appUserWithIdOnly = await prisma.appUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AppUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AppUser.
     * @param {AppUserDeleteArgs} args - Arguments to delete one AppUser.
     * @example
     * // Delete one AppUser
     * const AppUser = await prisma.appUser.delete({
     *   where: {
     *     // ... filter to delete one AppUser
     *   }
     * })
     * 
     */
    delete<T extends AppUserDeleteArgs>(args: SelectSubset<T, AppUserDeleteArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AppUser.
     * @param {AppUserUpdateArgs} args - Arguments to update one AppUser.
     * @example
     * // Update one AppUser
     * const appUser = await prisma.appUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppUserUpdateArgs>(args: SelectSubset<T, AppUserUpdateArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AppUsers.
     * @param {AppUserDeleteManyArgs} args - Arguments to filter AppUsers to delete.
     * @example
     * // Delete a few AppUsers
     * const { count } = await prisma.appUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppUserDeleteManyArgs>(args?: SelectSubset<T, AppUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppUsers
     * const appUser = await prisma.appUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppUserUpdateManyArgs>(args: SelectSubset<T, AppUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppUsers and returns the data updated in the database.
     * @param {AppUserUpdateManyAndReturnArgs} args - Arguments to update many AppUsers.
     * @example
     * // Update many AppUsers
     * const appUser = await prisma.appUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AppUsers and only return the `id`
     * const appUserWithIdOnly = await prisma.appUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppUserUpdateManyAndReturnArgs>(args: SelectSubset<T, AppUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AppUser.
     * @param {AppUserUpsertArgs} args - Arguments to update or create a AppUser.
     * @example
     * // Update or create a AppUser
     * const appUser = await prisma.appUser.upsert({
     *   create: {
     *     // ... data to create a AppUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppUser we want to update
     *   }
     * })
     */
    upsert<T extends AppUserUpsertArgs>(args: SelectSubset<T, AppUserUpsertArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserCountArgs} args - Arguments to filter AppUsers to count.
     * @example
     * // Count the number of AppUsers
     * const count = await prisma.appUser.count({
     *   where: {
     *     // ... the filter for the AppUsers we want to count
     *   }
     * })
    **/
    count<T extends AppUserCountArgs>(
      args?: Subset<T, AppUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppUserAggregateArgs>(args: Subset<T, AppUserAggregateArgs>): Prisma.PrismaPromise<GetAppUserAggregateType<T>>

    /**
     * Group by AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppUserGroupByArgs['orderBy'] }
        : { orderBy?: AppUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppUser model
   */
  readonly fields: AppUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memberships<T extends AppUser$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, AppUser$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ownedOutcomes<T extends AppUser$ownedOutcomesArgs<ExtArgs> = {}>(args?: Subset<T, AppUser$ownedOutcomesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tollgateDecisions<T extends AppUser$tollgateDecisionsArgs<ExtArgs> = {}>(args?: Subset<T, AppUser$tollgateDecisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    activityEvents<T extends AppUser$activityEventsArgs<ExtArgs> = {}>(args?: Subset<T, AppUser$activityEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppUser model
   */
  interface AppUserFieldRefs {
    readonly id: FieldRef<"AppUser", 'String'>
    readonly email: FieldRef<"AppUser", 'String'>
    readonly fullName: FieldRef<"AppUser", 'String'>
    readonly createdAt: FieldRef<"AppUser", 'DateTime'>
    readonly updatedAt: FieldRef<"AppUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppUser findUnique
   */
  export type AppUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findUniqueOrThrow
   */
  export type AppUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findFirst
   */
  export type AppUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findFirstOrThrow
   */
  export type AppUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findMany
   */
  export type AppUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter, which AppUsers to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser create
   */
  export type AppUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * The data needed to create a AppUser.
     */
    data: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
  }

  /**
   * AppUser createMany
   */
  export type AppUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppUser createManyAndReturn
   */
  export type AppUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AppUser update
   */
  export type AppUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * The data needed to update a AppUser.
     */
    data: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
    /**
     * Choose, which AppUser to update.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser updateMany
   */
  export type AppUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppUsers.
     */
    data: XOR<AppUserUpdateManyMutationInput, AppUserUncheckedUpdateManyInput>
    /**
     * Filter which AppUsers to update
     */
    where?: AppUserWhereInput
    /**
     * Limit how many AppUsers to update.
     */
    limit?: number
  }

  /**
   * AppUser updateManyAndReturn
   */
  export type AppUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * The data used to update AppUsers.
     */
    data: XOR<AppUserUpdateManyMutationInput, AppUserUncheckedUpdateManyInput>
    /**
     * Filter which AppUsers to update
     */
    where?: AppUserWhereInput
    /**
     * Limit how many AppUsers to update.
     */
    limit?: number
  }

  /**
   * AppUser upsert
   */
  export type AppUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * The filter to search for the AppUser to update in case it exists.
     */
    where: AppUserWhereUniqueInput
    /**
     * In case the AppUser found by the `where` argument doesn't exist, create a new AppUser with this data.
     */
    create: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
    /**
     * In case the AppUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
  }

  /**
   * AppUser delete
   */
  export type AppUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    /**
     * Filter which AppUser to delete.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser deleteMany
   */
  export type AppUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUsers to delete
     */
    where?: AppUserWhereInput
    /**
     * Limit how many AppUsers to delete.
     */
    limit?: number
  }

  /**
   * AppUser.memberships
   */
  export type AppUser$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    where?: MembershipWhereInput
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    cursor?: MembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MembershipScalarFieldEnum | MembershipScalarFieldEnum[]
  }

  /**
   * AppUser.ownedOutcomes
   */
  export type AppUser$ownedOutcomesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    where?: OutcomeWhereInput
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    cursor?: OutcomeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutcomeScalarFieldEnum | OutcomeScalarFieldEnum[]
  }

  /**
   * AppUser.tollgateDecisions
   */
  export type AppUser$tollgateDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    where?: TollgateWhereInput
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    cursor?: TollgateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TollgateScalarFieldEnum | TollgateScalarFieldEnum[]
  }

  /**
   * AppUser.activityEvents
   */
  export type AppUser$activityEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    where?: ActivityEventWhereInput
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    cursor?: ActivityEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivityEventScalarFieldEnum | ActivityEventScalarFieldEnum[]
  }

  /**
   * AppUser without action
   */
  export type AppUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
  }


  /**
   * Model Membership
   */

  export type AggregateMembership = {
    _count: MembershipCountAggregateOutputType | null
    _min: MembershipMinAggregateOutputType | null
    _max: MembershipMaxAggregateOutputType | null
  }

  export type MembershipMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    userId: string | null
    role: $Enums.MembershipRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    userId: string | null
    role: $Enums.MembershipRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipCountAggregateOutputType = {
    id: number
    organizationId: number
    userId: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MembershipMinAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipMaxAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipCountAggregateInputType = {
    id?: true
    organizationId?: true
    userId?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MembershipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Membership to aggregate.
     */
    where?: MembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memberships to fetch.
     */
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Memberships
    **/
    _count?: true | MembershipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MembershipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MembershipMaxAggregateInputType
  }

  export type GetMembershipAggregateType<T extends MembershipAggregateArgs> = {
        [P in keyof T & keyof AggregateMembership]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMembership[P]>
      : GetScalarType<T[P], AggregateMembership[P]>
  }




  export type MembershipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipWhereInput
    orderBy?: MembershipOrderByWithAggregationInput | MembershipOrderByWithAggregationInput[]
    by: MembershipScalarFieldEnum[] | MembershipScalarFieldEnum
    having?: MembershipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MembershipCountAggregateInputType | true
    _min?: MembershipMinAggregateInputType
    _max?: MembershipMaxAggregateInputType
  }

  export type MembershipGroupByOutputType = {
    id: string
    organizationId: string
    userId: string
    role: $Enums.MembershipRole
    createdAt: Date
    updatedAt: Date
    _count: MembershipCountAggregateOutputType | null
    _min: MembershipMinAggregateOutputType | null
    _max: MembershipMaxAggregateOutputType | null
  }

  type GetMembershipGroupByPayload<T extends MembershipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MembershipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MembershipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MembershipGroupByOutputType[P]>
            : GetScalarType<T[P], MembershipGroupByOutputType[P]>
        }
      >
    >


  export type MembershipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membership"]>

  export type MembershipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membership"]>

  export type MembershipSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membership"]>

  export type MembershipSelectScalar = {
    id?: boolean
    organizationId?: boolean
    userId?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MembershipOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "userId" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["membership"]>
  export type MembershipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }
  export type MembershipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }
  export type MembershipIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    user?: boolean | AppUserDefaultArgs<ExtArgs>
  }

  export type $MembershipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Membership"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      user: Prisma.$AppUserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      userId: string
      role: $Enums.MembershipRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["membership"]>
    composites: {}
  }

  type MembershipGetPayload<S extends boolean | null | undefined | MembershipDefaultArgs> = $Result.GetResult<Prisma.$MembershipPayload, S>

  type MembershipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MembershipFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MembershipCountAggregateInputType | true
    }

  export interface MembershipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Membership'], meta: { name: 'Membership' } }
    /**
     * Find zero or one Membership that matches the filter.
     * @param {MembershipFindUniqueArgs} args - Arguments to find a Membership
     * @example
     * // Get one Membership
     * const membership = await prisma.membership.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MembershipFindUniqueArgs>(args: SelectSubset<T, MembershipFindUniqueArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Membership that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MembershipFindUniqueOrThrowArgs} args - Arguments to find a Membership
     * @example
     * // Get one Membership
     * const membership = await prisma.membership.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MembershipFindUniqueOrThrowArgs>(args: SelectSubset<T, MembershipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Membership that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipFindFirstArgs} args - Arguments to find a Membership
     * @example
     * // Get one Membership
     * const membership = await prisma.membership.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MembershipFindFirstArgs>(args?: SelectSubset<T, MembershipFindFirstArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Membership that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipFindFirstOrThrowArgs} args - Arguments to find a Membership
     * @example
     * // Get one Membership
     * const membership = await prisma.membership.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MembershipFindFirstOrThrowArgs>(args?: SelectSubset<T, MembershipFindFirstOrThrowArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Memberships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Memberships
     * const memberships = await prisma.membership.findMany()
     * 
     * // Get first 10 Memberships
     * const memberships = await prisma.membership.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const membershipWithIdOnly = await prisma.membership.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MembershipFindManyArgs>(args?: SelectSubset<T, MembershipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Membership.
     * @param {MembershipCreateArgs} args - Arguments to create a Membership.
     * @example
     * // Create one Membership
     * const Membership = await prisma.membership.create({
     *   data: {
     *     // ... data to create a Membership
     *   }
     * })
     * 
     */
    create<T extends MembershipCreateArgs>(args: SelectSubset<T, MembershipCreateArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Memberships.
     * @param {MembershipCreateManyArgs} args - Arguments to create many Memberships.
     * @example
     * // Create many Memberships
     * const membership = await prisma.membership.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MembershipCreateManyArgs>(args?: SelectSubset<T, MembershipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Memberships and returns the data saved in the database.
     * @param {MembershipCreateManyAndReturnArgs} args - Arguments to create many Memberships.
     * @example
     * // Create many Memberships
     * const membership = await prisma.membership.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Memberships and only return the `id`
     * const membershipWithIdOnly = await prisma.membership.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MembershipCreateManyAndReturnArgs>(args?: SelectSubset<T, MembershipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Membership.
     * @param {MembershipDeleteArgs} args - Arguments to delete one Membership.
     * @example
     * // Delete one Membership
     * const Membership = await prisma.membership.delete({
     *   where: {
     *     // ... filter to delete one Membership
     *   }
     * })
     * 
     */
    delete<T extends MembershipDeleteArgs>(args: SelectSubset<T, MembershipDeleteArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Membership.
     * @param {MembershipUpdateArgs} args - Arguments to update one Membership.
     * @example
     * // Update one Membership
     * const membership = await prisma.membership.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MembershipUpdateArgs>(args: SelectSubset<T, MembershipUpdateArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Memberships.
     * @param {MembershipDeleteManyArgs} args - Arguments to filter Memberships to delete.
     * @example
     * // Delete a few Memberships
     * const { count } = await prisma.membership.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MembershipDeleteManyArgs>(args?: SelectSubset<T, MembershipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Memberships
     * const membership = await prisma.membership.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MembershipUpdateManyArgs>(args: SelectSubset<T, MembershipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Memberships and returns the data updated in the database.
     * @param {MembershipUpdateManyAndReturnArgs} args - Arguments to update many Memberships.
     * @example
     * // Update many Memberships
     * const membership = await prisma.membership.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Memberships and only return the `id`
     * const membershipWithIdOnly = await prisma.membership.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MembershipUpdateManyAndReturnArgs>(args: SelectSubset<T, MembershipUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Membership.
     * @param {MembershipUpsertArgs} args - Arguments to update or create a Membership.
     * @example
     * // Update or create a Membership
     * const membership = await prisma.membership.upsert({
     *   create: {
     *     // ... data to create a Membership
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Membership we want to update
     *   }
     * })
     */
    upsert<T extends MembershipUpsertArgs>(args: SelectSubset<T, MembershipUpsertArgs<ExtArgs>>): Prisma__MembershipClient<$Result.GetResult<Prisma.$MembershipPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Memberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipCountArgs} args - Arguments to filter Memberships to count.
     * @example
     * // Count the number of Memberships
     * const count = await prisma.membership.count({
     *   where: {
     *     // ... the filter for the Memberships we want to count
     *   }
     * })
    **/
    count<T extends MembershipCountArgs>(
      args?: Subset<T, MembershipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MembershipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Membership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MembershipAggregateArgs>(args: Subset<T, MembershipAggregateArgs>): Prisma.PrismaPromise<GetMembershipAggregateType<T>>

    /**
     * Group by Membership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MembershipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MembershipGroupByArgs['orderBy'] }
        : { orderBy?: MembershipGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MembershipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMembershipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Membership model
   */
  readonly fields: MembershipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Membership.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MembershipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends AppUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AppUserDefaultArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Membership model
   */
  interface MembershipFieldRefs {
    readonly id: FieldRef<"Membership", 'String'>
    readonly organizationId: FieldRef<"Membership", 'String'>
    readonly userId: FieldRef<"Membership", 'String'>
    readonly role: FieldRef<"Membership", 'MembershipRole'>
    readonly createdAt: FieldRef<"Membership", 'DateTime'>
    readonly updatedAt: FieldRef<"Membership", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Membership findUnique
   */
  export type MembershipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter, which Membership to fetch.
     */
    where: MembershipWhereUniqueInput
  }

  /**
   * Membership findUniqueOrThrow
   */
  export type MembershipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter, which Membership to fetch.
     */
    where: MembershipWhereUniqueInput
  }

  /**
   * Membership findFirst
   */
  export type MembershipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter, which Membership to fetch.
     */
    where?: MembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memberships to fetch.
     */
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memberships.
     */
    cursor?: MembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memberships.
     */
    distinct?: MembershipScalarFieldEnum | MembershipScalarFieldEnum[]
  }

  /**
   * Membership findFirstOrThrow
   */
  export type MembershipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter, which Membership to fetch.
     */
    where?: MembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memberships to fetch.
     */
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Memberships.
     */
    cursor?: MembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Memberships.
     */
    distinct?: MembershipScalarFieldEnum | MembershipScalarFieldEnum[]
  }

  /**
   * Membership findMany
   */
  export type MembershipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter, which Memberships to fetch.
     */
    where?: MembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Memberships to fetch.
     */
    orderBy?: MembershipOrderByWithRelationInput | MembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Memberships.
     */
    cursor?: MembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Memberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Memberships.
     */
    skip?: number
    distinct?: MembershipScalarFieldEnum | MembershipScalarFieldEnum[]
  }

  /**
   * Membership create
   */
  export type MembershipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * The data needed to create a Membership.
     */
    data: XOR<MembershipCreateInput, MembershipUncheckedCreateInput>
  }

  /**
   * Membership createMany
   */
  export type MembershipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Memberships.
     */
    data: MembershipCreateManyInput | MembershipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Membership createManyAndReturn
   */
  export type MembershipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * The data used to create many Memberships.
     */
    data: MembershipCreateManyInput | MembershipCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Membership update
   */
  export type MembershipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * The data needed to update a Membership.
     */
    data: XOR<MembershipUpdateInput, MembershipUncheckedUpdateInput>
    /**
     * Choose, which Membership to update.
     */
    where: MembershipWhereUniqueInput
  }

  /**
   * Membership updateMany
   */
  export type MembershipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Memberships.
     */
    data: XOR<MembershipUpdateManyMutationInput, MembershipUncheckedUpdateManyInput>
    /**
     * Filter which Memberships to update
     */
    where?: MembershipWhereInput
    /**
     * Limit how many Memberships to update.
     */
    limit?: number
  }

  /**
   * Membership updateManyAndReturn
   */
  export type MembershipUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * The data used to update Memberships.
     */
    data: XOR<MembershipUpdateManyMutationInput, MembershipUncheckedUpdateManyInput>
    /**
     * Filter which Memberships to update
     */
    where?: MembershipWhereInput
    /**
     * Limit how many Memberships to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Membership upsert
   */
  export type MembershipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * The filter to search for the Membership to update in case it exists.
     */
    where: MembershipWhereUniqueInput
    /**
     * In case the Membership found by the `where` argument doesn't exist, create a new Membership with this data.
     */
    create: XOR<MembershipCreateInput, MembershipUncheckedCreateInput>
    /**
     * In case the Membership was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MembershipUpdateInput, MembershipUncheckedUpdateInput>
  }

  /**
   * Membership delete
   */
  export type MembershipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
    /**
     * Filter which Membership to delete.
     */
    where: MembershipWhereUniqueInput
  }

  /**
   * Membership deleteMany
   */
  export type MembershipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Memberships to delete
     */
    where?: MembershipWhereInput
    /**
     * Limit how many Memberships to delete.
     */
    limit?: number
  }

  /**
   * Membership without action
   */
  export type MembershipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Membership
     */
    select?: MembershipSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Membership
     */
    omit?: MembershipOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipInclude<ExtArgs> | null
  }


  /**
   * Model Outcome
   */

  export type AggregateOutcome = {
    _count: OutcomeCountAggregateOutputType | null
    _min: OutcomeMinAggregateOutputType | null
    _max: OutcomeMaxAggregateOutputType | null
  }

  export type OutcomeMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    key: string | null
    title: string | null
    problemStatement: string | null
    outcomeStatement: string | null
    baselineDefinition: string | null
    baselineSource: string | null
    timeframe: string | null
    valueOwnerId: string | null
    riskProfile: $Enums.RiskProfile | null
    aiAccelerationLevel: $Enums.AiAccelerationLevel | null
    status: $Enums.OutcomeStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutcomeMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    key: string | null
    title: string | null
    problemStatement: string | null
    outcomeStatement: string | null
    baselineDefinition: string | null
    baselineSource: string | null
    timeframe: string | null
    valueOwnerId: string | null
    riskProfile: $Enums.RiskProfile | null
    aiAccelerationLevel: $Enums.AiAccelerationLevel | null
    status: $Enums.OutcomeStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OutcomeCountAggregateOutputType = {
    id: number
    organizationId: number
    key: number
    title: number
    problemStatement: number
    outcomeStatement: number
    baselineDefinition: number
    baselineSource: number
    timeframe: number
    valueOwnerId: number
    riskProfile: number
    aiAccelerationLevel: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OutcomeMinAggregateInputType = {
    id?: true
    organizationId?: true
    key?: true
    title?: true
    problemStatement?: true
    outcomeStatement?: true
    baselineDefinition?: true
    baselineSource?: true
    timeframe?: true
    valueOwnerId?: true
    riskProfile?: true
    aiAccelerationLevel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutcomeMaxAggregateInputType = {
    id?: true
    organizationId?: true
    key?: true
    title?: true
    problemStatement?: true
    outcomeStatement?: true
    baselineDefinition?: true
    baselineSource?: true
    timeframe?: true
    valueOwnerId?: true
    riskProfile?: true
    aiAccelerationLevel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OutcomeCountAggregateInputType = {
    id?: true
    organizationId?: true
    key?: true
    title?: true
    problemStatement?: true
    outcomeStatement?: true
    baselineDefinition?: true
    baselineSource?: true
    timeframe?: true
    valueOwnerId?: true
    riskProfile?: true
    aiAccelerationLevel?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OutcomeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outcome to aggregate.
     */
    where?: OutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outcomes to fetch.
     */
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Outcomes
    **/
    _count?: true | OutcomeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutcomeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutcomeMaxAggregateInputType
  }

  export type GetOutcomeAggregateType<T extends OutcomeAggregateArgs> = {
        [P in keyof T & keyof AggregateOutcome]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutcome[P]>
      : GetScalarType<T[P], AggregateOutcome[P]>
  }




  export type OutcomeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutcomeWhereInput
    orderBy?: OutcomeOrderByWithAggregationInput | OutcomeOrderByWithAggregationInput[]
    by: OutcomeScalarFieldEnum[] | OutcomeScalarFieldEnum
    having?: OutcomeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutcomeCountAggregateInputType | true
    _min?: OutcomeMinAggregateInputType
    _max?: OutcomeMaxAggregateInputType
  }

  export type OutcomeGroupByOutputType = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement: string | null
    outcomeStatement: string | null
    baselineDefinition: string | null
    baselineSource: string | null
    timeframe: string | null
    valueOwnerId: string | null
    riskProfile: $Enums.RiskProfile
    aiAccelerationLevel: $Enums.AiAccelerationLevel
    status: $Enums.OutcomeStatus
    createdAt: Date
    updatedAt: Date
    _count: OutcomeCountAggregateOutputType | null
    _min: OutcomeMinAggregateOutputType | null
    _max: OutcomeMaxAggregateOutputType | null
  }

  type GetOutcomeGroupByPayload<T extends OutcomeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutcomeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutcomeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutcomeGroupByOutputType[P]>
            : GetScalarType<T[P], OutcomeGroupByOutputType[P]>
        }
      >
    >


  export type OutcomeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    key?: boolean
    title?: boolean
    problemStatement?: boolean
    outcomeStatement?: boolean
    baselineDefinition?: boolean
    baselineSource?: boolean
    timeframe?: boolean
    valueOwnerId?: boolean
    riskProfile?: boolean
    aiAccelerationLevel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
    epics?: boolean | Outcome$epicsArgs<ExtArgs>
    stories?: boolean | Outcome$storiesArgs<ExtArgs>
    _count?: boolean | OutcomeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outcome"]>

  export type OutcomeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    key?: boolean
    title?: boolean
    problemStatement?: boolean
    outcomeStatement?: boolean
    baselineDefinition?: boolean
    baselineSource?: boolean
    timeframe?: boolean
    valueOwnerId?: boolean
    riskProfile?: boolean
    aiAccelerationLevel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
  }, ExtArgs["result"]["outcome"]>

  export type OutcomeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    key?: boolean
    title?: boolean
    problemStatement?: boolean
    outcomeStatement?: boolean
    baselineDefinition?: boolean
    baselineSource?: boolean
    timeframe?: boolean
    valueOwnerId?: boolean
    riskProfile?: boolean
    aiAccelerationLevel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
  }, ExtArgs["result"]["outcome"]>

  export type OutcomeSelectScalar = {
    id?: boolean
    organizationId?: boolean
    key?: boolean
    title?: boolean
    problemStatement?: boolean
    outcomeStatement?: boolean
    baselineDefinition?: boolean
    baselineSource?: boolean
    timeframe?: boolean
    valueOwnerId?: boolean
    riskProfile?: boolean
    aiAccelerationLevel?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OutcomeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "key" | "title" | "problemStatement" | "outcomeStatement" | "baselineDefinition" | "baselineSource" | "timeframe" | "valueOwnerId" | "riskProfile" | "aiAccelerationLevel" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["outcome"]>
  export type OutcomeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
    epics?: boolean | Outcome$epicsArgs<ExtArgs>
    stories?: boolean | Outcome$storiesArgs<ExtArgs>
    _count?: boolean | OutcomeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OutcomeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
  }
  export type OutcomeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    valueOwner?: boolean | Outcome$valueOwnerArgs<ExtArgs>
  }

  export type $OutcomePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Outcome"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      valueOwner: Prisma.$AppUserPayload<ExtArgs> | null
      epics: Prisma.$EpicPayload<ExtArgs>[]
      stories: Prisma.$StoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      key: string
      title: string
      problemStatement: string | null
      outcomeStatement: string | null
      baselineDefinition: string | null
      baselineSource: string | null
      timeframe: string | null
      valueOwnerId: string | null
      riskProfile: $Enums.RiskProfile
      aiAccelerationLevel: $Enums.AiAccelerationLevel
      status: $Enums.OutcomeStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["outcome"]>
    composites: {}
  }

  type OutcomeGetPayload<S extends boolean | null | undefined | OutcomeDefaultArgs> = $Result.GetResult<Prisma.$OutcomePayload, S>

  type OutcomeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutcomeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutcomeCountAggregateInputType | true
    }

  export interface OutcomeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Outcome'], meta: { name: 'Outcome' } }
    /**
     * Find zero or one Outcome that matches the filter.
     * @param {OutcomeFindUniqueArgs} args - Arguments to find a Outcome
     * @example
     * // Get one Outcome
     * const outcome = await prisma.outcome.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutcomeFindUniqueArgs>(args: SelectSubset<T, OutcomeFindUniqueArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Outcome that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutcomeFindUniqueOrThrowArgs} args - Arguments to find a Outcome
     * @example
     * // Get one Outcome
     * const outcome = await prisma.outcome.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutcomeFindUniqueOrThrowArgs>(args: SelectSubset<T, OutcomeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outcome that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeFindFirstArgs} args - Arguments to find a Outcome
     * @example
     * // Get one Outcome
     * const outcome = await prisma.outcome.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutcomeFindFirstArgs>(args?: SelectSubset<T, OutcomeFindFirstArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outcome that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeFindFirstOrThrowArgs} args - Arguments to find a Outcome
     * @example
     * // Get one Outcome
     * const outcome = await prisma.outcome.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutcomeFindFirstOrThrowArgs>(args?: SelectSubset<T, OutcomeFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Outcomes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Outcomes
     * const outcomes = await prisma.outcome.findMany()
     * 
     * // Get first 10 Outcomes
     * const outcomes = await prisma.outcome.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outcomeWithIdOnly = await prisma.outcome.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutcomeFindManyArgs>(args?: SelectSubset<T, OutcomeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Outcome.
     * @param {OutcomeCreateArgs} args - Arguments to create a Outcome.
     * @example
     * // Create one Outcome
     * const Outcome = await prisma.outcome.create({
     *   data: {
     *     // ... data to create a Outcome
     *   }
     * })
     * 
     */
    create<T extends OutcomeCreateArgs>(args: SelectSubset<T, OutcomeCreateArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Outcomes.
     * @param {OutcomeCreateManyArgs} args - Arguments to create many Outcomes.
     * @example
     * // Create many Outcomes
     * const outcome = await prisma.outcome.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutcomeCreateManyArgs>(args?: SelectSubset<T, OutcomeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Outcomes and returns the data saved in the database.
     * @param {OutcomeCreateManyAndReturnArgs} args - Arguments to create many Outcomes.
     * @example
     * // Create many Outcomes
     * const outcome = await prisma.outcome.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Outcomes and only return the `id`
     * const outcomeWithIdOnly = await prisma.outcome.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutcomeCreateManyAndReturnArgs>(args?: SelectSubset<T, OutcomeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Outcome.
     * @param {OutcomeDeleteArgs} args - Arguments to delete one Outcome.
     * @example
     * // Delete one Outcome
     * const Outcome = await prisma.outcome.delete({
     *   where: {
     *     // ... filter to delete one Outcome
     *   }
     * })
     * 
     */
    delete<T extends OutcomeDeleteArgs>(args: SelectSubset<T, OutcomeDeleteArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Outcome.
     * @param {OutcomeUpdateArgs} args - Arguments to update one Outcome.
     * @example
     * // Update one Outcome
     * const outcome = await prisma.outcome.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutcomeUpdateArgs>(args: SelectSubset<T, OutcomeUpdateArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Outcomes.
     * @param {OutcomeDeleteManyArgs} args - Arguments to filter Outcomes to delete.
     * @example
     * // Delete a few Outcomes
     * const { count } = await prisma.outcome.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutcomeDeleteManyArgs>(args?: SelectSubset<T, OutcomeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Outcomes
     * const outcome = await prisma.outcome.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutcomeUpdateManyArgs>(args: SelectSubset<T, OutcomeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outcomes and returns the data updated in the database.
     * @param {OutcomeUpdateManyAndReturnArgs} args - Arguments to update many Outcomes.
     * @example
     * // Update many Outcomes
     * const outcome = await prisma.outcome.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Outcomes and only return the `id`
     * const outcomeWithIdOnly = await prisma.outcome.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutcomeUpdateManyAndReturnArgs>(args: SelectSubset<T, OutcomeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Outcome.
     * @param {OutcomeUpsertArgs} args - Arguments to update or create a Outcome.
     * @example
     * // Update or create a Outcome
     * const outcome = await prisma.outcome.upsert({
     *   create: {
     *     // ... data to create a Outcome
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Outcome we want to update
     *   }
     * })
     */
    upsert<T extends OutcomeUpsertArgs>(args: SelectSubset<T, OutcomeUpsertArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Outcomes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeCountArgs} args - Arguments to filter Outcomes to count.
     * @example
     * // Count the number of Outcomes
     * const count = await prisma.outcome.count({
     *   where: {
     *     // ... the filter for the Outcomes we want to count
     *   }
     * })
    **/
    count<T extends OutcomeCountArgs>(
      args?: Subset<T, OutcomeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutcomeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Outcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutcomeAggregateArgs>(args: Subset<T, OutcomeAggregateArgs>): Prisma.PrismaPromise<GetOutcomeAggregateType<T>>

    /**
     * Group by Outcome.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutcomeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutcomeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutcomeGroupByArgs['orderBy'] }
        : { orderBy?: OutcomeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutcomeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutcomeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Outcome model
   */
  readonly fields: OutcomeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Outcome.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutcomeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    valueOwner<T extends Outcome$valueOwnerArgs<ExtArgs> = {}>(args?: Subset<T, Outcome$valueOwnerArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    epics<T extends Outcome$epicsArgs<ExtArgs> = {}>(args?: Subset<T, Outcome$epicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    stories<T extends Outcome$storiesArgs<ExtArgs> = {}>(args?: Subset<T, Outcome$storiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Outcome model
   */
  interface OutcomeFieldRefs {
    readonly id: FieldRef<"Outcome", 'String'>
    readonly organizationId: FieldRef<"Outcome", 'String'>
    readonly key: FieldRef<"Outcome", 'String'>
    readonly title: FieldRef<"Outcome", 'String'>
    readonly problemStatement: FieldRef<"Outcome", 'String'>
    readonly outcomeStatement: FieldRef<"Outcome", 'String'>
    readonly baselineDefinition: FieldRef<"Outcome", 'String'>
    readonly baselineSource: FieldRef<"Outcome", 'String'>
    readonly timeframe: FieldRef<"Outcome", 'String'>
    readonly valueOwnerId: FieldRef<"Outcome", 'String'>
    readonly riskProfile: FieldRef<"Outcome", 'RiskProfile'>
    readonly aiAccelerationLevel: FieldRef<"Outcome", 'AiAccelerationLevel'>
    readonly status: FieldRef<"Outcome", 'OutcomeStatus'>
    readonly createdAt: FieldRef<"Outcome", 'DateTime'>
    readonly updatedAt: FieldRef<"Outcome", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Outcome findUnique
   */
  export type OutcomeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter, which Outcome to fetch.
     */
    where: OutcomeWhereUniqueInput
  }

  /**
   * Outcome findUniqueOrThrow
   */
  export type OutcomeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter, which Outcome to fetch.
     */
    where: OutcomeWhereUniqueInput
  }

  /**
   * Outcome findFirst
   */
  export type OutcomeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter, which Outcome to fetch.
     */
    where?: OutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outcomes to fetch.
     */
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outcomes.
     */
    cursor?: OutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outcomes.
     */
    distinct?: OutcomeScalarFieldEnum | OutcomeScalarFieldEnum[]
  }

  /**
   * Outcome findFirstOrThrow
   */
  export type OutcomeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter, which Outcome to fetch.
     */
    where?: OutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outcomes to fetch.
     */
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outcomes.
     */
    cursor?: OutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outcomes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outcomes.
     */
    distinct?: OutcomeScalarFieldEnum | OutcomeScalarFieldEnum[]
  }

  /**
   * Outcome findMany
   */
  export type OutcomeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter, which Outcomes to fetch.
     */
    where?: OutcomeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outcomes to fetch.
     */
    orderBy?: OutcomeOrderByWithRelationInput | OutcomeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Outcomes.
     */
    cursor?: OutcomeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outcomes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outcomes.
     */
    skip?: number
    distinct?: OutcomeScalarFieldEnum | OutcomeScalarFieldEnum[]
  }

  /**
   * Outcome create
   */
  export type OutcomeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * The data needed to create a Outcome.
     */
    data: XOR<OutcomeCreateInput, OutcomeUncheckedCreateInput>
  }

  /**
   * Outcome createMany
   */
  export type OutcomeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Outcomes.
     */
    data: OutcomeCreateManyInput | OutcomeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outcome createManyAndReturn
   */
  export type OutcomeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * The data used to create many Outcomes.
     */
    data: OutcomeCreateManyInput | OutcomeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Outcome update
   */
  export type OutcomeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * The data needed to update a Outcome.
     */
    data: XOR<OutcomeUpdateInput, OutcomeUncheckedUpdateInput>
    /**
     * Choose, which Outcome to update.
     */
    where: OutcomeWhereUniqueInput
  }

  /**
   * Outcome updateMany
   */
  export type OutcomeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Outcomes.
     */
    data: XOR<OutcomeUpdateManyMutationInput, OutcomeUncheckedUpdateManyInput>
    /**
     * Filter which Outcomes to update
     */
    where?: OutcomeWhereInput
    /**
     * Limit how many Outcomes to update.
     */
    limit?: number
  }

  /**
   * Outcome updateManyAndReturn
   */
  export type OutcomeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * The data used to update Outcomes.
     */
    data: XOR<OutcomeUpdateManyMutationInput, OutcomeUncheckedUpdateManyInput>
    /**
     * Filter which Outcomes to update
     */
    where?: OutcomeWhereInput
    /**
     * Limit how many Outcomes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Outcome upsert
   */
  export type OutcomeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * The filter to search for the Outcome to update in case it exists.
     */
    where: OutcomeWhereUniqueInput
    /**
     * In case the Outcome found by the `where` argument doesn't exist, create a new Outcome with this data.
     */
    create: XOR<OutcomeCreateInput, OutcomeUncheckedCreateInput>
    /**
     * In case the Outcome was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutcomeUpdateInput, OutcomeUncheckedUpdateInput>
  }

  /**
   * Outcome delete
   */
  export type OutcomeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
    /**
     * Filter which Outcome to delete.
     */
    where: OutcomeWhereUniqueInput
  }

  /**
   * Outcome deleteMany
   */
  export type OutcomeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outcomes to delete
     */
    where?: OutcomeWhereInput
    /**
     * Limit how many Outcomes to delete.
     */
    limit?: number
  }

  /**
   * Outcome.valueOwner
   */
  export type Outcome$valueOwnerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    where?: AppUserWhereInput
  }

  /**
   * Outcome.epics
   */
  export type Outcome$epicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    where?: EpicWhereInput
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    cursor?: EpicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Outcome.stories
   */
  export type Outcome$storiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    where?: StoryWhereInput
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    cursor?: StoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Outcome without action
   */
  export type OutcomeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outcome
     */
    select?: OutcomeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outcome
     */
    omit?: OutcomeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutcomeInclude<ExtArgs> | null
  }


  /**
   * Model Epic
   */

  export type AggregateEpic = {
    _count: EpicCountAggregateOutputType | null
    _min: EpicMinAggregateOutputType | null
    _max: EpicMaxAggregateOutputType | null
  }

  export type EpicMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    outcomeId: string | null
    key: string | null
    title: string | null
    purpose: string | null
    status: $Enums.EpicStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EpicMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    outcomeId: string | null
    key: string | null
    title: string | null
    purpose: string | null
    status: $Enums.EpicStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EpicCountAggregateOutputType = {
    id: number
    organizationId: number
    outcomeId: number
    key: number
    title: number
    purpose: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EpicMinAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    key?: true
    title?: true
    purpose?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EpicMaxAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    key?: true
    title?: true
    purpose?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EpicCountAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    key?: true
    title?: true
    purpose?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EpicAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Epic to aggregate.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Epics
    **/
    _count?: true | EpicCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EpicMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EpicMaxAggregateInputType
  }

  export type GetEpicAggregateType<T extends EpicAggregateArgs> = {
        [P in keyof T & keyof AggregateEpic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEpic[P]>
      : GetScalarType<T[P], AggregateEpic[P]>
  }




  export type EpicGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EpicWhereInput
    orderBy?: EpicOrderByWithAggregationInput | EpicOrderByWithAggregationInput[]
    by: EpicScalarFieldEnum[] | EpicScalarFieldEnum
    having?: EpicScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EpicCountAggregateInputType | true
    _min?: EpicMinAggregateInputType
    _max?: EpicMaxAggregateInputType
  }

  export type EpicGroupByOutputType = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status: $Enums.EpicStatus
    createdAt: Date
    updatedAt: Date
    _count: EpicCountAggregateOutputType | null
    _min: EpicMinAggregateOutputType | null
    _max: EpicMaxAggregateOutputType | null
  }

  type GetEpicGroupByPayload<T extends EpicGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EpicGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EpicGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EpicGroupByOutputType[P]>
            : GetScalarType<T[P], EpicGroupByOutputType[P]>
        }
      >
    >


  export type EpicSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    key?: boolean
    title?: boolean
    purpose?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    stories?: boolean | Epic$storiesArgs<ExtArgs>
    _count?: boolean | EpicCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["epic"]>

  export type EpicSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    key?: boolean
    title?: boolean
    purpose?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["epic"]>

  export type EpicSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    key?: boolean
    title?: boolean
    purpose?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["epic"]>

  export type EpicSelectScalar = {
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    key?: boolean
    title?: boolean
    purpose?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EpicOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "outcomeId" | "key" | "title" | "purpose" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["epic"]>
  export type EpicInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    stories?: boolean | Epic$storiesArgs<ExtArgs>
    _count?: boolean | EpicCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EpicIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
  }
  export type EpicIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
  }

  export type $EpicPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Epic"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      outcome: Prisma.$OutcomePayload<ExtArgs>
      stories: Prisma.$StoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      outcomeId: string
      key: string
      title: string
      purpose: string
      status: $Enums.EpicStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["epic"]>
    composites: {}
  }

  type EpicGetPayload<S extends boolean | null | undefined | EpicDefaultArgs> = $Result.GetResult<Prisma.$EpicPayload, S>

  type EpicCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EpicFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EpicCountAggregateInputType | true
    }

  export interface EpicDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Epic'], meta: { name: 'Epic' } }
    /**
     * Find zero or one Epic that matches the filter.
     * @param {EpicFindUniqueArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EpicFindUniqueArgs>(args: SelectSubset<T, EpicFindUniqueArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Epic that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EpicFindUniqueOrThrowArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EpicFindUniqueOrThrowArgs>(args: SelectSubset<T, EpicFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Epic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindFirstArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EpicFindFirstArgs>(args?: SelectSubset<T, EpicFindFirstArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Epic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindFirstOrThrowArgs} args - Arguments to find a Epic
     * @example
     * // Get one Epic
     * const epic = await prisma.epic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EpicFindFirstOrThrowArgs>(args?: SelectSubset<T, EpicFindFirstOrThrowArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Epics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Epics
     * const epics = await prisma.epic.findMany()
     * 
     * // Get first 10 Epics
     * const epics = await prisma.epic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const epicWithIdOnly = await prisma.epic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EpicFindManyArgs>(args?: SelectSubset<T, EpicFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Epic.
     * @param {EpicCreateArgs} args - Arguments to create a Epic.
     * @example
     * // Create one Epic
     * const Epic = await prisma.epic.create({
     *   data: {
     *     // ... data to create a Epic
     *   }
     * })
     * 
     */
    create<T extends EpicCreateArgs>(args: SelectSubset<T, EpicCreateArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Epics.
     * @param {EpicCreateManyArgs} args - Arguments to create many Epics.
     * @example
     * // Create many Epics
     * const epic = await prisma.epic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EpicCreateManyArgs>(args?: SelectSubset<T, EpicCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Epics and returns the data saved in the database.
     * @param {EpicCreateManyAndReturnArgs} args - Arguments to create many Epics.
     * @example
     * // Create many Epics
     * const epic = await prisma.epic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Epics and only return the `id`
     * const epicWithIdOnly = await prisma.epic.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EpicCreateManyAndReturnArgs>(args?: SelectSubset<T, EpicCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Epic.
     * @param {EpicDeleteArgs} args - Arguments to delete one Epic.
     * @example
     * // Delete one Epic
     * const Epic = await prisma.epic.delete({
     *   where: {
     *     // ... filter to delete one Epic
     *   }
     * })
     * 
     */
    delete<T extends EpicDeleteArgs>(args: SelectSubset<T, EpicDeleteArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Epic.
     * @param {EpicUpdateArgs} args - Arguments to update one Epic.
     * @example
     * // Update one Epic
     * const epic = await prisma.epic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EpicUpdateArgs>(args: SelectSubset<T, EpicUpdateArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Epics.
     * @param {EpicDeleteManyArgs} args - Arguments to filter Epics to delete.
     * @example
     * // Delete a few Epics
     * const { count } = await prisma.epic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EpicDeleteManyArgs>(args?: SelectSubset<T, EpicDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Epics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Epics
     * const epic = await prisma.epic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EpicUpdateManyArgs>(args: SelectSubset<T, EpicUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Epics and returns the data updated in the database.
     * @param {EpicUpdateManyAndReturnArgs} args - Arguments to update many Epics.
     * @example
     * // Update many Epics
     * const epic = await prisma.epic.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Epics and only return the `id`
     * const epicWithIdOnly = await prisma.epic.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EpicUpdateManyAndReturnArgs>(args: SelectSubset<T, EpicUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Epic.
     * @param {EpicUpsertArgs} args - Arguments to update or create a Epic.
     * @example
     * // Update or create a Epic
     * const epic = await prisma.epic.upsert({
     *   create: {
     *     // ... data to create a Epic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Epic we want to update
     *   }
     * })
     */
    upsert<T extends EpicUpsertArgs>(args: SelectSubset<T, EpicUpsertArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Epics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicCountArgs} args - Arguments to filter Epics to count.
     * @example
     * // Count the number of Epics
     * const count = await prisma.epic.count({
     *   where: {
     *     // ... the filter for the Epics we want to count
     *   }
     * })
    **/
    count<T extends EpicCountArgs>(
      args?: Subset<T, EpicCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EpicCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Epic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EpicAggregateArgs>(args: Subset<T, EpicAggregateArgs>): Prisma.PrismaPromise<GetEpicAggregateType<T>>

    /**
     * Group by Epic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EpicGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EpicGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EpicGroupByArgs['orderBy'] }
        : { orderBy?: EpicGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EpicGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEpicGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Epic model
   */
  readonly fields: EpicFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Epic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EpicClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    outcome<T extends OutcomeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OutcomeDefaultArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    stories<T extends Epic$storiesArgs<ExtArgs> = {}>(args?: Subset<T, Epic$storiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Epic model
   */
  interface EpicFieldRefs {
    readonly id: FieldRef<"Epic", 'String'>
    readonly organizationId: FieldRef<"Epic", 'String'>
    readonly outcomeId: FieldRef<"Epic", 'String'>
    readonly key: FieldRef<"Epic", 'String'>
    readonly title: FieldRef<"Epic", 'String'>
    readonly purpose: FieldRef<"Epic", 'String'>
    readonly status: FieldRef<"Epic", 'EpicStatus'>
    readonly createdAt: FieldRef<"Epic", 'DateTime'>
    readonly updatedAt: FieldRef<"Epic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Epic findUnique
   */
  export type EpicFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic findUniqueOrThrow
   */
  export type EpicFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic findFirst
   */
  export type EpicFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Epics.
     */
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic findFirstOrThrow
   */
  export type EpicFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epic to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Epics.
     */
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic findMany
   */
  export type EpicFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter, which Epics to fetch.
     */
    where?: EpicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Epics to fetch.
     */
    orderBy?: EpicOrderByWithRelationInput | EpicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Epics.
     */
    cursor?: EpicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Epics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Epics.
     */
    skip?: number
    distinct?: EpicScalarFieldEnum | EpicScalarFieldEnum[]
  }

  /**
   * Epic create
   */
  export type EpicCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The data needed to create a Epic.
     */
    data: XOR<EpicCreateInput, EpicUncheckedCreateInput>
  }

  /**
   * Epic createMany
   */
  export type EpicCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Epics.
     */
    data: EpicCreateManyInput | EpicCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Epic createManyAndReturn
   */
  export type EpicCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * The data used to create many Epics.
     */
    data: EpicCreateManyInput | EpicCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Epic update
   */
  export type EpicUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The data needed to update a Epic.
     */
    data: XOR<EpicUpdateInput, EpicUncheckedUpdateInput>
    /**
     * Choose, which Epic to update.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic updateMany
   */
  export type EpicUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Epics.
     */
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyInput>
    /**
     * Filter which Epics to update
     */
    where?: EpicWhereInput
    /**
     * Limit how many Epics to update.
     */
    limit?: number
  }

  /**
   * Epic updateManyAndReturn
   */
  export type EpicUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * The data used to update Epics.
     */
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyInput>
    /**
     * Filter which Epics to update
     */
    where?: EpicWhereInput
    /**
     * Limit how many Epics to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Epic upsert
   */
  export type EpicUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * The filter to search for the Epic to update in case it exists.
     */
    where: EpicWhereUniqueInput
    /**
     * In case the Epic found by the `where` argument doesn't exist, create a new Epic with this data.
     */
    create: XOR<EpicCreateInput, EpicUncheckedCreateInput>
    /**
     * In case the Epic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EpicUpdateInput, EpicUncheckedUpdateInput>
  }

  /**
   * Epic delete
   */
  export type EpicDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
    /**
     * Filter which Epic to delete.
     */
    where: EpicWhereUniqueInput
  }

  /**
   * Epic deleteMany
   */
  export type EpicDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Epics to delete
     */
    where?: EpicWhereInput
    /**
     * Limit how many Epics to delete.
     */
    limit?: number
  }

  /**
   * Epic.stories
   */
  export type Epic$storiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    where?: StoryWhereInput
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    cursor?: StoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Epic without action
   */
  export type EpicDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Epic
     */
    select?: EpicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Epic
     */
    omit?: EpicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EpicInclude<ExtArgs> | null
  }


  /**
   * Model Story
   */

  export type AggregateStory = {
    _count: StoryCountAggregateOutputType | null
    _min: StoryMinAggregateOutputType | null
    _max: StoryMaxAggregateOutputType | null
  }

  export type StoryMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    outcomeId: string | null
    epicId: string | null
    key: string | null
    title: string | null
    storyType: $Enums.StoryType | null
    valueIntent: string | null
    aiAccelerationLevel: $Enums.AiAccelerationLevel | null
    testDefinition: string | null
    status: $Enums.StoryStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoryMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    outcomeId: string | null
    epicId: string | null
    key: string | null
    title: string | null
    storyType: $Enums.StoryType | null
    valueIntent: string | null
    aiAccelerationLevel: $Enums.AiAccelerationLevel | null
    testDefinition: string | null
    status: $Enums.StoryStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StoryCountAggregateOutputType = {
    id: number
    organizationId: number
    outcomeId: number
    epicId: number
    key: number
    title: number
    storyType: number
    valueIntent: number
    acceptanceCriteria: number
    aiUsageScope: number
    aiAccelerationLevel: number
    testDefinition: number
    definitionOfDone: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StoryMinAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    epicId?: true
    key?: true
    title?: true
    storyType?: true
    valueIntent?: true
    aiAccelerationLevel?: true
    testDefinition?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoryMaxAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    epicId?: true
    key?: true
    title?: true
    storyType?: true
    valueIntent?: true
    aiAccelerationLevel?: true
    testDefinition?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StoryCountAggregateInputType = {
    id?: true
    organizationId?: true
    outcomeId?: true
    epicId?: true
    key?: true
    title?: true
    storyType?: true
    valueIntent?: true
    acceptanceCriteria?: true
    aiUsageScope?: true
    aiAccelerationLevel?: true
    testDefinition?: true
    definitionOfDone?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Story to aggregate.
     */
    where?: StoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stories to fetch.
     */
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stories
    **/
    _count?: true | StoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StoryMaxAggregateInputType
  }

  export type GetStoryAggregateType<T extends StoryAggregateArgs> = {
        [P in keyof T & keyof AggregateStory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStory[P]>
      : GetScalarType<T[P], AggregateStory[P]>
  }




  export type StoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoryWhereInput
    orderBy?: StoryOrderByWithAggregationInput | StoryOrderByWithAggregationInput[]
    by: StoryScalarFieldEnum[] | StoryScalarFieldEnum
    having?: StoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StoryCountAggregateInputType | true
    _min?: StoryMinAggregateInputType
    _max?: StoryMaxAggregateInputType
  }

  export type StoryGroupByOutputType = {
    id: string
    organizationId: string
    outcomeId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria: string[]
    aiUsageScope: string[]
    aiAccelerationLevel: $Enums.AiAccelerationLevel
    testDefinition: string | null
    definitionOfDone: string[]
    status: $Enums.StoryStatus
    createdAt: Date
    updatedAt: Date
    _count: StoryCountAggregateOutputType | null
    _min: StoryMinAggregateOutputType | null
    _max: StoryMaxAggregateOutputType | null
  }

  type GetStoryGroupByPayload<T extends StoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StoryGroupByOutputType[P]>
            : GetScalarType<T[P], StoryGroupByOutputType[P]>
        }
      >
    >


  export type StorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    epicId?: boolean
    key?: boolean
    title?: boolean
    storyType?: boolean
    valueIntent?: boolean
    acceptanceCriteria?: boolean
    aiUsageScope?: boolean
    aiAccelerationLevel?: boolean
    testDefinition?: boolean
    definitionOfDone?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["story"]>

  export type StorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    epicId?: boolean
    key?: boolean
    title?: boolean
    storyType?: boolean
    valueIntent?: boolean
    acceptanceCriteria?: boolean
    aiUsageScope?: boolean
    aiAccelerationLevel?: boolean
    testDefinition?: boolean
    definitionOfDone?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["story"]>

  export type StorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    epicId?: boolean
    key?: boolean
    title?: boolean
    storyType?: boolean
    valueIntent?: boolean
    acceptanceCriteria?: boolean
    aiUsageScope?: boolean
    aiAccelerationLevel?: boolean
    testDefinition?: boolean
    definitionOfDone?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["story"]>

  export type StorySelectScalar = {
    id?: boolean
    organizationId?: boolean
    outcomeId?: boolean
    epicId?: boolean
    key?: boolean
    title?: boolean
    storyType?: boolean
    valueIntent?: boolean
    acceptanceCriteria?: boolean
    aiUsageScope?: boolean
    aiAccelerationLevel?: boolean
    testDefinition?: boolean
    definitionOfDone?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "outcomeId" | "epicId" | "key" | "title" | "storyType" | "valueIntent" | "acceptanceCriteria" | "aiUsageScope" | "aiAccelerationLevel" | "testDefinition" | "definitionOfDone" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["story"]>
  export type StoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }
  export type StoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }
  export type StoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    outcome?: boolean | OutcomeDefaultArgs<ExtArgs>
    epic?: boolean | EpicDefaultArgs<ExtArgs>
  }

  export type $StoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Story"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      outcome: Prisma.$OutcomePayload<ExtArgs>
      epic: Prisma.$EpicPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      outcomeId: string
      epicId: string
      key: string
      title: string
      storyType: $Enums.StoryType
      valueIntent: string
      acceptanceCriteria: string[]
      aiUsageScope: string[]
      aiAccelerationLevel: $Enums.AiAccelerationLevel
      testDefinition: string | null
      definitionOfDone: string[]
      status: $Enums.StoryStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["story"]>
    composites: {}
  }

  type StoryGetPayload<S extends boolean | null | undefined | StoryDefaultArgs> = $Result.GetResult<Prisma.$StoryPayload, S>

  type StoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StoryCountAggregateInputType | true
    }

  export interface StoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Story'], meta: { name: 'Story' } }
    /**
     * Find zero or one Story that matches the filter.
     * @param {StoryFindUniqueArgs} args - Arguments to find a Story
     * @example
     * // Get one Story
     * const story = await prisma.story.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StoryFindUniqueArgs>(args: SelectSubset<T, StoryFindUniqueArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Story that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StoryFindUniqueOrThrowArgs} args - Arguments to find a Story
     * @example
     * // Get one Story
     * const story = await prisma.story.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StoryFindUniqueOrThrowArgs>(args: SelectSubset<T, StoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Story that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryFindFirstArgs} args - Arguments to find a Story
     * @example
     * // Get one Story
     * const story = await prisma.story.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StoryFindFirstArgs>(args?: SelectSubset<T, StoryFindFirstArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Story that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryFindFirstOrThrowArgs} args - Arguments to find a Story
     * @example
     * // Get one Story
     * const story = await prisma.story.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StoryFindFirstOrThrowArgs>(args?: SelectSubset<T, StoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Stories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stories
     * const stories = await prisma.story.findMany()
     * 
     * // Get first 10 Stories
     * const stories = await prisma.story.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const storyWithIdOnly = await prisma.story.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StoryFindManyArgs>(args?: SelectSubset<T, StoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Story.
     * @param {StoryCreateArgs} args - Arguments to create a Story.
     * @example
     * // Create one Story
     * const Story = await prisma.story.create({
     *   data: {
     *     // ... data to create a Story
     *   }
     * })
     * 
     */
    create<T extends StoryCreateArgs>(args: SelectSubset<T, StoryCreateArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Stories.
     * @param {StoryCreateManyArgs} args - Arguments to create many Stories.
     * @example
     * // Create many Stories
     * const story = await prisma.story.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StoryCreateManyArgs>(args?: SelectSubset<T, StoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stories and returns the data saved in the database.
     * @param {StoryCreateManyAndReturnArgs} args - Arguments to create many Stories.
     * @example
     * // Create many Stories
     * const story = await prisma.story.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stories and only return the `id`
     * const storyWithIdOnly = await prisma.story.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StoryCreateManyAndReturnArgs>(args?: SelectSubset<T, StoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Story.
     * @param {StoryDeleteArgs} args - Arguments to delete one Story.
     * @example
     * // Delete one Story
     * const Story = await prisma.story.delete({
     *   where: {
     *     // ... filter to delete one Story
     *   }
     * })
     * 
     */
    delete<T extends StoryDeleteArgs>(args: SelectSubset<T, StoryDeleteArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Story.
     * @param {StoryUpdateArgs} args - Arguments to update one Story.
     * @example
     * // Update one Story
     * const story = await prisma.story.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StoryUpdateArgs>(args: SelectSubset<T, StoryUpdateArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Stories.
     * @param {StoryDeleteManyArgs} args - Arguments to filter Stories to delete.
     * @example
     * // Delete a few Stories
     * const { count } = await prisma.story.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StoryDeleteManyArgs>(args?: SelectSubset<T, StoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stories
     * const story = await prisma.story.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StoryUpdateManyArgs>(args: SelectSubset<T, StoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stories and returns the data updated in the database.
     * @param {StoryUpdateManyAndReturnArgs} args - Arguments to update many Stories.
     * @example
     * // Update many Stories
     * const story = await prisma.story.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Stories and only return the `id`
     * const storyWithIdOnly = await prisma.story.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StoryUpdateManyAndReturnArgs>(args: SelectSubset<T, StoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Story.
     * @param {StoryUpsertArgs} args - Arguments to update or create a Story.
     * @example
     * // Update or create a Story
     * const story = await prisma.story.upsert({
     *   create: {
     *     // ... data to create a Story
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Story we want to update
     *   }
     * })
     */
    upsert<T extends StoryUpsertArgs>(args: SelectSubset<T, StoryUpsertArgs<ExtArgs>>): Prisma__StoryClient<$Result.GetResult<Prisma.$StoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Stories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryCountArgs} args - Arguments to filter Stories to count.
     * @example
     * // Count the number of Stories
     * const count = await prisma.story.count({
     *   where: {
     *     // ... the filter for the Stories we want to count
     *   }
     * })
    **/
    count<T extends StoryCountArgs>(
      args?: Subset<T, StoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Story.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StoryAggregateArgs>(args: Subset<T, StoryAggregateArgs>): Prisma.PrismaPromise<GetStoryAggregateType<T>>

    /**
     * Group by Story.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StoryGroupByArgs['orderBy'] }
        : { orderBy?: StoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Story model
   */
  readonly fields: StoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Story.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    outcome<T extends OutcomeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OutcomeDefaultArgs<ExtArgs>>): Prisma__OutcomeClient<$Result.GetResult<Prisma.$OutcomePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    epic<T extends EpicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EpicDefaultArgs<ExtArgs>>): Prisma__EpicClient<$Result.GetResult<Prisma.$EpicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Story model
   */
  interface StoryFieldRefs {
    readonly id: FieldRef<"Story", 'String'>
    readonly organizationId: FieldRef<"Story", 'String'>
    readonly outcomeId: FieldRef<"Story", 'String'>
    readonly epicId: FieldRef<"Story", 'String'>
    readonly key: FieldRef<"Story", 'String'>
    readonly title: FieldRef<"Story", 'String'>
    readonly storyType: FieldRef<"Story", 'StoryType'>
    readonly valueIntent: FieldRef<"Story", 'String'>
    readonly acceptanceCriteria: FieldRef<"Story", 'String[]'>
    readonly aiUsageScope: FieldRef<"Story", 'String[]'>
    readonly aiAccelerationLevel: FieldRef<"Story", 'AiAccelerationLevel'>
    readonly testDefinition: FieldRef<"Story", 'String'>
    readonly definitionOfDone: FieldRef<"Story", 'String[]'>
    readonly status: FieldRef<"Story", 'StoryStatus'>
    readonly createdAt: FieldRef<"Story", 'DateTime'>
    readonly updatedAt: FieldRef<"Story", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Story findUnique
   */
  export type StoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter, which Story to fetch.
     */
    where: StoryWhereUniqueInput
  }

  /**
   * Story findUniqueOrThrow
   */
  export type StoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter, which Story to fetch.
     */
    where: StoryWhereUniqueInput
  }

  /**
   * Story findFirst
   */
  export type StoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter, which Story to fetch.
     */
    where?: StoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stories to fetch.
     */
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stories.
     */
    cursor?: StoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stories.
     */
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Story findFirstOrThrow
   */
  export type StoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter, which Story to fetch.
     */
    where?: StoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stories to fetch.
     */
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stories.
     */
    cursor?: StoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stories.
     */
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Story findMany
   */
  export type StoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter, which Stories to fetch.
     */
    where?: StoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stories to fetch.
     */
    orderBy?: StoryOrderByWithRelationInput | StoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stories.
     */
    cursor?: StoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stories.
     */
    skip?: number
    distinct?: StoryScalarFieldEnum | StoryScalarFieldEnum[]
  }

  /**
   * Story create
   */
  export type StoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Story.
     */
    data: XOR<StoryCreateInput, StoryUncheckedCreateInput>
  }

  /**
   * Story createMany
   */
  export type StoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stories.
     */
    data: StoryCreateManyInput | StoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Story createManyAndReturn
   */
  export type StoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * The data used to create many Stories.
     */
    data: StoryCreateManyInput | StoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Story update
   */
  export type StoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Story.
     */
    data: XOR<StoryUpdateInput, StoryUncheckedUpdateInput>
    /**
     * Choose, which Story to update.
     */
    where: StoryWhereUniqueInput
  }

  /**
   * Story updateMany
   */
  export type StoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stories.
     */
    data: XOR<StoryUpdateManyMutationInput, StoryUncheckedUpdateManyInput>
    /**
     * Filter which Stories to update
     */
    where?: StoryWhereInput
    /**
     * Limit how many Stories to update.
     */
    limit?: number
  }

  /**
   * Story updateManyAndReturn
   */
  export type StoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * The data used to update Stories.
     */
    data: XOR<StoryUpdateManyMutationInput, StoryUncheckedUpdateManyInput>
    /**
     * Filter which Stories to update
     */
    where?: StoryWhereInput
    /**
     * Limit how many Stories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Story upsert
   */
  export type StoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Story to update in case it exists.
     */
    where: StoryWhereUniqueInput
    /**
     * In case the Story found by the `where` argument doesn't exist, create a new Story with this data.
     */
    create: XOR<StoryCreateInput, StoryUncheckedCreateInput>
    /**
     * In case the Story was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StoryUpdateInput, StoryUncheckedUpdateInput>
  }

  /**
   * Story delete
   */
  export type StoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
    /**
     * Filter which Story to delete.
     */
    where: StoryWhereUniqueInput
  }

  /**
   * Story deleteMany
   */
  export type StoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stories to delete
     */
    where?: StoryWhereInput
    /**
     * Limit how many Stories to delete.
     */
    limit?: number
  }

  /**
   * Story without action
   */
  export type StoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Story
     */
    select?: StorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Story
     */
    omit?: StoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StoryInclude<ExtArgs> | null
  }


  /**
   * Model Tollgate
   */

  export type AggregateTollgate = {
    _count: TollgateCountAggregateOutputType | null
    _min: TollgateMinAggregateOutputType | null
    _max: TollgateMaxAggregateOutputType | null
  }

  export type TollgateMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    entityType: $Enums.TollgateEntityType | null
    entityId: string | null
    tollgateType: $Enums.TollgateType | null
    status: $Enums.TollgateStatus | null
    decidedBy: string | null
    decidedAt: Date | null
    comments: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TollgateMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    entityType: $Enums.TollgateEntityType | null
    entityId: string | null
    tollgateType: $Enums.TollgateType | null
    status: $Enums.TollgateStatus | null
    decidedBy: string | null
    decidedAt: Date | null
    comments: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TollgateCountAggregateOutputType = {
    id: number
    organizationId: number
    entityType: number
    entityId: number
    tollgateType: number
    status: number
    blockers: number
    approverRoles: number
    decidedBy: number
    decidedAt: number
    comments: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TollgateMinAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    tollgateType?: true
    status?: true
    decidedBy?: true
    decidedAt?: true
    comments?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TollgateMaxAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    tollgateType?: true
    status?: true
    decidedBy?: true
    decidedAt?: true
    comments?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TollgateCountAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    tollgateType?: true
    status?: true
    blockers?: true
    approverRoles?: true
    decidedBy?: true
    decidedAt?: true
    comments?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TollgateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tollgate to aggregate.
     */
    where?: TollgateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tollgates to fetch.
     */
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TollgateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tollgates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tollgates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tollgates
    **/
    _count?: true | TollgateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TollgateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TollgateMaxAggregateInputType
  }

  export type GetTollgateAggregateType<T extends TollgateAggregateArgs> = {
        [P in keyof T & keyof AggregateTollgate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTollgate[P]>
      : GetScalarType<T[P], AggregateTollgate[P]>
  }




  export type TollgateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TollgateWhereInput
    orderBy?: TollgateOrderByWithAggregationInput | TollgateOrderByWithAggregationInput[]
    by: TollgateScalarFieldEnum[] | TollgateScalarFieldEnum
    having?: TollgateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TollgateCountAggregateInputType | true
    _min?: TollgateMinAggregateInputType
    _max?: TollgateMaxAggregateInputType
  }

  export type TollgateGroupByOutputType = {
    id: string
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status: $Enums.TollgateStatus
    blockers: string[]
    approverRoles: $Enums.MembershipRole[]
    decidedBy: string | null
    decidedAt: Date | null
    comments: string | null
    createdAt: Date
    updatedAt: Date
    _count: TollgateCountAggregateOutputType | null
    _min: TollgateMinAggregateOutputType | null
    _max: TollgateMaxAggregateOutputType | null
  }

  type GetTollgateGroupByPayload<T extends TollgateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TollgateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TollgateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TollgateGroupByOutputType[P]>
            : GetScalarType<T[P], TollgateGroupByOutputType[P]>
        }
      >
    >


  export type TollgateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    tollgateType?: boolean
    status?: boolean
    blockers?: boolean
    approverRoles?: boolean
    decidedBy?: boolean
    decidedAt?: boolean
    comments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }, ExtArgs["result"]["tollgate"]>

  export type TollgateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    tollgateType?: boolean
    status?: boolean
    blockers?: boolean
    approverRoles?: boolean
    decidedBy?: boolean
    decidedAt?: boolean
    comments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }, ExtArgs["result"]["tollgate"]>

  export type TollgateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    tollgateType?: boolean
    status?: boolean
    blockers?: boolean
    approverRoles?: boolean
    decidedBy?: boolean
    decidedAt?: boolean
    comments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }, ExtArgs["result"]["tollgate"]>

  export type TollgateSelectScalar = {
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    tollgateType?: boolean
    status?: boolean
    blockers?: boolean
    approverRoles?: boolean
    decidedBy?: boolean
    decidedAt?: boolean
    comments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TollgateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "entityType" | "entityId" | "tollgateType" | "status" | "blockers" | "approverRoles" | "decidedBy" | "decidedAt" | "comments" | "createdAt" | "updatedAt", ExtArgs["result"]["tollgate"]>
  export type TollgateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }
  export type TollgateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }
  export type TollgateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    decisionActor?: boolean | Tollgate$decisionActorArgs<ExtArgs>
  }

  export type $TollgatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tollgate"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      decisionActor: Prisma.$AppUserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      entityType: $Enums.TollgateEntityType
      entityId: string
      tollgateType: $Enums.TollgateType
      status: $Enums.TollgateStatus
      blockers: string[]
      approverRoles: $Enums.MembershipRole[]
      decidedBy: string | null
      decidedAt: Date | null
      comments: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tollgate"]>
    composites: {}
  }

  type TollgateGetPayload<S extends boolean | null | undefined | TollgateDefaultArgs> = $Result.GetResult<Prisma.$TollgatePayload, S>

  type TollgateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TollgateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TollgateCountAggregateInputType | true
    }

  export interface TollgateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tollgate'], meta: { name: 'Tollgate' } }
    /**
     * Find zero or one Tollgate that matches the filter.
     * @param {TollgateFindUniqueArgs} args - Arguments to find a Tollgate
     * @example
     * // Get one Tollgate
     * const tollgate = await prisma.tollgate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TollgateFindUniqueArgs>(args: SelectSubset<T, TollgateFindUniqueArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tollgate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TollgateFindUniqueOrThrowArgs} args - Arguments to find a Tollgate
     * @example
     * // Get one Tollgate
     * const tollgate = await prisma.tollgate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TollgateFindUniqueOrThrowArgs>(args: SelectSubset<T, TollgateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tollgate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateFindFirstArgs} args - Arguments to find a Tollgate
     * @example
     * // Get one Tollgate
     * const tollgate = await prisma.tollgate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TollgateFindFirstArgs>(args?: SelectSubset<T, TollgateFindFirstArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tollgate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateFindFirstOrThrowArgs} args - Arguments to find a Tollgate
     * @example
     * // Get one Tollgate
     * const tollgate = await prisma.tollgate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TollgateFindFirstOrThrowArgs>(args?: SelectSubset<T, TollgateFindFirstOrThrowArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tollgates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tollgates
     * const tollgates = await prisma.tollgate.findMany()
     * 
     * // Get first 10 Tollgates
     * const tollgates = await prisma.tollgate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tollgateWithIdOnly = await prisma.tollgate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TollgateFindManyArgs>(args?: SelectSubset<T, TollgateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tollgate.
     * @param {TollgateCreateArgs} args - Arguments to create a Tollgate.
     * @example
     * // Create one Tollgate
     * const Tollgate = await prisma.tollgate.create({
     *   data: {
     *     // ... data to create a Tollgate
     *   }
     * })
     * 
     */
    create<T extends TollgateCreateArgs>(args: SelectSubset<T, TollgateCreateArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tollgates.
     * @param {TollgateCreateManyArgs} args - Arguments to create many Tollgates.
     * @example
     * // Create many Tollgates
     * const tollgate = await prisma.tollgate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TollgateCreateManyArgs>(args?: SelectSubset<T, TollgateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tollgates and returns the data saved in the database.
     * @param {TollgateCreateManyAndReturnArgs} args - Arguments to create many Tollgates.
     * @example
     * // Create many Tollgates
     * const tollgate = await prisma.tollgate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tollgates and only return the `id`
     * const tollgateWithIdOnly = await prisma.tollgate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TollgateCreateManyAndReturnArgs>(args?: SelectSubset<T, TollgateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tollgate.
     * @param {TollgateDeleteArgs} args - Arguments to delete one Tollgate.
     * @example
     * // Delete one Tollgate
     * const Tollgate = await prisma.tollgate.delete({
     *   where: {
     *     // ... filter to delete one Tollgate
     *   }
     * })
     * 
     */
    delete<T extends TollgateDeleteArgs>(args: SelectSubset<T, TollgateDeleteArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tollgate.
     * @param {TollgateUpdateArgs} args - Arguments to update one Tollgate.
     * @example
     * // Update one Tollgate
     * const tollgate = await prisma.tollgate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TollgateUpdateArgs>(args: SelectSubset<T, TollgateUpdateArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tollgates.
     * @param {TollgateDeleteManyArgs} args - Arguments to filter Tollgates to delete.
     * @example
     * // Delete a few Tollgates
     * const { count } = await prisma.tollgate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TollgateDeleteManyArgs>(args?: SelectSubset<T, TollgateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tollgates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tollgates
     * const tollgate = await prisma.tollgate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TollgateUpdateManyArgs>(args: SelectSubset<T, TollgateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tollgates and returns the data updated in the database.
     * @param {TollgateUpdateManyAndReturnArgs} args - Arguments to update many Tollgates.
     * @example
     * // Update many Tollgates
     * const tollgate = await prisma.tollgate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tollgates and only return the `id`
     * const tollgateWithIdOnly = await prisma.tollgate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TollgateUpdateManyAndReturnArgs>(args: SelectSubset<T, TollgateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tollgate.
     * @param {TollgateUpsertArgs} args - Arguments to update or create a Tollgate.
     * @example
     * // Update or create a Tollgate
     * const tollgate = await prisma.tollgate.upsert({
     *   create: {
     *     // ... data to create a Tollgate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tollgate we want to update
     *   }
     * })
     */
    upsert<T extends TollgateUpsertArgs>(args: SelectSubset<T, TollgateUpsertArgs<ExtArgs>>): Prisma__TollgateClient<$Result.GetResult<Prisma.$TollgatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tollgates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateCountArgs} args - Arguments to filter Tollgates to count.
     * @example
     * // Count the number of Tollgates
     * const count = await prisma.tollgate.count({
     *   where: {
     *     // ... the filter for the Tollgates we want to count
     *   }
     * })
    **/
    count<T extends TollgateCountArgs>(
      args?: Subset<T, TollgateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TollgateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tollgate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TollgateAggregateArgs>(args: Subset<T, TollgateAggregateArgs>): Prisma.PrismaPromise<GetTollgateAggregateType<T>>

    /**
     * Group by Tollgate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TollgateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TollgateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TollgateGroupByArgs['orderBy'] }
        : { orderBy?: TollgateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TollgateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTollgateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tollgate model
   */
  readonly fields: TollgateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tollgate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TollgateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    decisionActor<T extends Tollgate$decisionActorArgs<ExtArgs> = {}>(args?: Subset<T, Tollgate$decisionActorArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tollgate model
   */
  interface TollgateFieldRefs {
    readonly id: FieldRef<"Tollgate", 'String'>
    readonly organizationId: FieldRef<"Tollgate", 'String'>
    readonly entityType: FieldRef<"Tollgate", 'TollgateEntityType'>
    readonly entityId: FieldRef<"Tollgate", 'String'>
    readonly tollgateType: FieldRef<"Tollgate", 'TollgateType'>
    readonly status: FieldRef<"Tollgate", 'TollgateStatus'>
    readonly blockers: FieldRef<"Tollgate", 'String[]'>
    readonly approverRoles: FieldRef<"Tollgate", 'MembershipRole[]'>
    readonly decidedBy: FieldRef<"Tollgate", 'String'>
    readonly decidedAt: FieldRef<"Tollgate", 'DateTime'>
    readonly comments: FieldRef<"Tollgate", 'String'>
    readonly createdAt: FieldRef<"Tollgate", 'DateTime'>
    readonly updatedAt: FieldRef<"Tollgate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tollgate findUnique
   */
  export type TollgateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter, which Tollgate to fetch.
     */
    where: TollgateWhereUniqueInput
  }

  /**
   * Tollgate findUniqueOrThrow
   */
  export type TollgateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter, which Tollgate to fetch.
     */
    where: TollgateWhereUniqueInput
  }

  /**
   * Tollgate findFirst
   */
  export type TollgateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter, which Tollgate to fetch.
     */
    where?: TollgateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tollgates to fetch.
     */
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tollgates.
     */
    cursor?: TollgateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tollgates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tollgates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tollgates.
     */
    distinct?: TollgateScalarFieldEnum | TollgateScalarFieldEnum[]
  }

  /**
   * Tollgate findFirstOrThrow
   */
  export type TollgateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter, which Tollgate to fetch.
     */
    where?: TollgateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tollgates to fetch.
     */
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tollgates.
     */
    cursor?: TollgateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tollgates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tollgates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tollgates.
     */
    distinct?: TollgateScalarFieldEnum | TollgateScalarFieldEnum[]
  }

  /**
   * Tollgate findMany
   */
  export type TollgateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter, which Tollgates to fetch.
     */
    where?: TollgateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tollgates to fetch.
     */
    orderBy?: TollgateOrderByWithRelationInput | TollgateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tollgates.
     */
    cursor?: TollgateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tollgates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tollgates.
     */
    skip?: number
    distinct?: TollgateScalarFieldEnum | TollgateScalarFieldEnum[]
  }

  /**
   * Tollgate create
   */
  export type TollgateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * The data needed to create a Tollgate.
     */
    data: XOR<TollgateCreateInput, TollgateUncheckedCreateInput>
  }

  /**
   * Tollgate createMany
   */
  export type TollgateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tollgates.
     */
    data: TollgateCreateManyInput | TollgateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tollgate createManyAndReturn
   */
  export type TollgateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * The data used to create many Tollgates.
     */
    data: TollgateCreateManyInput | TollgateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tollgate update
   */
  export type TollgateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * The data needed to update a Tollgate.
     */
    data: XOR<TollgateUpdateInput, TollgateUncheckedUpdateInput>
    /**
     * Choose, which Tollgate to update.
     */
    where: TollgateWhereUniqueInput
  }

  /**
   * Tollgate updateMany
   */
  export type TollgateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tollgates.
     */
    data: XOR<TollgateUpdateManyMutationInput, TollgateUncheckedUpdateManyInput>
    /**
     * Filter which Tollgates to update
     */
    where?: TollgateWhereInput
    /**
     * Limit how many Tollgates to update.
     */
    limit?: number
  }

  /**
   * Tollgate updateManyAndReturn
   */
  export type TollgateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * The data used to update Tollgates.
     */
    data: XOR<TollgateUpdateManyMutationInput, TollgateUncheckedUpdateManyInput>
    /**
     * Filter which Tollgates to update
     */
    where?: TollgateWhereInput
    /**
     * Limit how many Tollgates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tollgate upsert
   */
  export type TollgateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * The filter to search for the Tollgate to update in case it exists.
     */
    where: TollgateWhereUniqueInput
    /**
     * In case the Tollgate found by the `where` argument doesn't exist, create a new Tollgate with this data.
     */
    create: XOR<TollgateCreateInput, TollgateUncheckedCreateInput>
    /**
     * In case the Tollgate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TollgateUpdateInput, TollgateUncheckedUpdateInput>
  }

  /**
   * Tollgate delete
   */
  export type TollgateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
    /**
     * Filter which Tollgate to delete.
     */
    where: TollgateWhereUniqueInput
  }

  /**
   * Tollgate deleteMany
   */
  export type TollgateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tollgates to delete
     */
    where?: TollgateWhereInput
    /**
     * Limit how many Tollgates to delete.
     */
    limit?: number
  }

  /**
   * Tollgate.decisionActor
   */
  export type Tollgate$decisionActorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    where?: AppUserWhereInput
  }

  /**
   * Tollgate without action
   */
  export type TollgateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tollgate
     */
    select?: TollgateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tollgate
     */
    omit?: TollgateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TollgateInclude<ExtArgs> | null
  }


  /**
   * Model ActivityEvent
   */

  export type AggregateActivityEvent = {
    _count: ActivityEventCountAggregateOutputType | null
    _min: ActivityEventMinAggregateOutputType | null
    _max: ActivityEventMaxAggregateOutputType | null
  }

  export type ActivityEventMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    entityType: $Enums.ActivityEntityType | null
    entityId: string | null
    eventType: $Enums.ActivityEventType | null
    actorId: string | null
    createdAt: Date | null
  }

  export type ActivityEventMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    entityType: $Enums.ActivityEntityType | null
    entityId: string | null
    eventType: $Enums.ActivityEventType | null
    actorId: string | null
    createdAt: Date | null
  }

  export type ActivityEventCountAggregateOutputType = {
    id: number
    organizationId: number
    entityType: number
    entityId: number
    eventType: number
    actorId: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type ActivityEventMinAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    eventType?: true
    actorId?: true
    createdAt?: true
  }

  export type ActivityEventMaxAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    eventType?: true
    actorId?: true
    createdAt?: true
  }

  export type ActivityEventCountAggregateInputType = {
    id?: true
    organizationId?: true
    entityType?: true
    entityId?: true
    eventType?: true
    actorId?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type ActivityEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityEvent to aggregate.
     */
    where?: ActivityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityEvents to fetch.
     */
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivityEvents
    **/
    _count?: true | ActivityEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityEventMaxAggregateInputType
  }

  export type GetActivityEventAggregateType<T extends ActivityEventAggregateArgs> = {
        [P in keyof T & keyof AggregateActivityEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivityEvent[P]>
      : GetScalarType<T[P], AggregateActivityEvent[P]>
  }




  export type ActivityEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityEventWhereInput
    orderBy?: ActivityEventOrderByWithAggregationInput | ActivityEventOrderByWithAggregationInput[]
    by: ActivityEventScalarFieldEnum[] | ActivityEventScalarFieldEnum
    having?: ActivityEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityEventCountAggregateInputType | true
    _min?: ActivityEventMinAggregateInputType
    _max?: ActivityEventMaxAggregateInputType
  }

  export type ActivityEventGroupByOutputType = {
    id: string
    organizationId: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    actorId: string | null
    metadata: JsonValue | null
    createdAt: Date
    _count: ActivityEventCountAggregateOutputType | null
    _min: ActivityEventMinAggregateOutputType | null
    _max: ActivityEventMaxAggregateOutputType | null
  }

  type GetActivityEventGroupByPayload<T extends ActivityEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityEventGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityEventGroupByOutputType[P]>
        }
      >
    >


  export type ActivityEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    eventType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }, ExtArgs["result"]["activityEvent"]>

  export type ActivityEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    eventType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }, ExtArgs["result"]["activityEvent"]>

  export type ActivityEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    eventType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }, ExtArgs["result"]["activityEvent"]>

  export type ActivityEventSelectScalar = {
    id?: boolean
    organizationId?: boolean
    entityType?: boolean
    entityId?: boolean
    eventType?: boolean
    actorId?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type ActivityEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "entityType" | "entityId" | "eventType" | "actorId" | "metadata" | "createdAt", ExtArgs["result"]["activityEvent"]>
  export type ActivityEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }
  export type ActivityEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }
  export type ActivityEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    actor?: boolean | ActivityEvent$actorArgs<ExtArgs>
  }

  export type $ActivityEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivityEvent"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
      actor: Prisma.$AppUserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      entityType: $Enums.ActivityEntityType
      entityId: string
      eventType: $Enums.ActivityEventType
      actorId: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["activityEvent"]>
    composites: {}
  }

  type ActivityEventGetPayload<S extends boolean | null | undefined | ActivityEventDefaultArgs> = $Result.GetResult<Prisma.$ActivityEventPayload, S>

  type ActivityEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityEventCountAggregateInputType | true
    }

  export interface ActivityEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivityEvent'], meta: { name: 'ActivityEvent' } }
    /**
     * Find zero or one ActivityEvent that matches the filter.
     * @param {ActivityEventFindUniqueArgs} args - Arguments to find a ActivityEvent
     * @example
     * // Get one ActivityEvent
     * const activityEvent = await prisma.activityEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityEventFindUniqueArgs>(args: SelectSubset<T, ActivityEventFindUniqueArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivityEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityEventFindUniqueOrThrowArgs} args - Arguments to find a ActivityEvent
     * @example
     * // Get one ActivityEvent
     * const activityEvent = await prisma.activityEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityEventFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventFindFirstArgs} args - Arguments to find a ActivityEvent
     * @example
     * // Get one ActivityEvent
     * const activityEvent = await prisma.activityEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityEventFindFirstArgs>(args?: SelectSubset<T, ActivityEventFindFirstArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventFindFirstOrThrowArgs} args - Arguments to find a ActivityEvent
     * @example
     * // Get one ActivityEvent
     * const activityEvent = await prisma.activityEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityEventFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivityEvents
     * const activityEvents = await prisma.activityEvent.findMany()
     * 
     * // Get first 10 ActivityEvents
     * const activityEvents = await prisma.activityEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityEventWithIdOnly = await prisma.activityEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityEventFindManyArgs>(args?: SelectSubset<T, ActivityEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivityEvent.
     * @param {ActivityEventCreateArgs} args - Arguments to create a ActivityEvent.
     * @example
     * // Create one ActivityEvent
     * const ActivityEvent = await prisma.activityEvent.create({
     *   data: {
     *     // ... data to create a ActivityEvent
     *   }
     * })
     * 
     */
    create<T extends ActivityEventCreateArgs>(args: SelectSubset<T, ActivityEventCreateArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivityEvents.
     * @param {ActivityEventCreateManyArgs} args - Arguments to create many ActivityEvents.
     * @example
     * // Create many ActivityEvents
     * const activityEvent = await prisma.activityEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityEventCreateManyArgs>(args?: SelectSubset<T, ActivityEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivityEvents and returns the data saved in the database.
     * @param {ActivityEventCreateManyAndReturnArgs} args - Arguments to create many ActivityEvents.
     * @example
     * // Create many ActivityEvents
     * const activityEvent = await prisma.activityEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivityEvents and only return the `id`
     * const activityEventWithIdOnly = await prisma.activityEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivityEventCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivityEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivityEvent.
     * @param {ActivityEventDeleteArgs} args - Arguments to delete one ActivityEvent.
     * @example
     * // Delete one ActivityEvent
     * const ActivityEvent = await prisma.activityEvent.delete({
     *   where: {
     *     // ... filter to delete one ActivityEvent
     *   }
     * })
     * 
     */
    delete<T extends ActivityEventDeleteArgs>(args: SelectSubset<T, ActivityEventDeleteArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivityEvent.
     * @param {ActivityEventUpdateArgs} args - Arguments to update one ActivityEvent.
     * @example
     * // Update one ActivityEvent
     * const activityEvent = await prisma.activityEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityEventUpdateArgs>(args: SelectSubset<T, ActivityEventUpdateArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivityEvents.
     * @param {ActivityEventDeleteManyArgs} args - Arguments to filter ActivityEvents to delete.
     * @example
     * // Delete a few ActivityEvents
     * const { count } = await prisma.activityEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityEventDeleteManyArgs>(args?: SelectSubset<T, ActivityEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivityEvents
     * const activityEvent = await prisma.activityEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityEventUpdateManyArgs>(args: SelectSubset<T, ActivityEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityEvents and returns the data updated in the database.
     * @param {ActivityEventUpdateManyAndReturnArgs} args - Arguments to update many ActivityEvents.
     * @example
     * // Update many ActivityEvents
     * const activityEvent = await prisma.activityEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivityEvents and only return the `id`
     * const activityEventWithIdOnly = await prisma.activityEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivityEventUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivityEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivityEvent.
     * @param {ActivityEventUpsertArgs} args - Arguments to update or create a ActivityEvent.
     * @example
     * // Update or create a ActivityEvent
     * const activityEvent = await prisma.activityEvent.upsert({
     *   create: {
     *     // ... data to create a ActivityEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivityEvent we want to update
     *   }
     * })
     */
    upsert<T extends ActivityEventUpsertArgs>(args: SelectSubset<T, ActivityEventUpsertArgs<ExtArgs>>): Prisma__ActivityEventClient<$Result.GetResult<Prisma.$ActivityEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivityEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventCountArgs} args - Arguments to filter ActivityEvents to count.
     * @example
     * // Count the number of ActivityEvents
     * const count = await prisma.activityEvent.count({
     *   where: {
     *     // ... the filter for the ActivityEvents we want to count
     *   }
     * })
    **/
    count<T extends ActivityEventCountArgs>(
      args?: Subset<T, ActivityEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivityEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivityEventAggregateArgs>(args: Subset<T, ActivityEventAggregateArgs>): Prisma.PrismaPromise<GetActivityEventAggregateType<T>>

    /**
     * Group by ActivityEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivityEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityEventGroupByArgs['orderBy'] }
        : { orderBy?: ActivityEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivityEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivityEvent model
   */
  readonly fields: ActivityEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivityEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    actor<T extends ActivityEvent$actorArgs<ExtArgs> = {}>(args?: Subset<T, ActivityEvent$actorArgs<ExtArgs>>): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ActivityEvent model
   */
  interface ActivityEventFieldRefs {
    readonly id: FieldRef<"ActivityEvent", 'String'>
    readonly organizationId: FieldRef<"ActivityEvent", 'String'>
    readonly entityType: FieldRef<"ActivityEvent", 'ActivityEntityType'>
    readonly entityId: FieldRef<"ActivityEvent", 'String'>
    readonly eventType: FieldRef<"ActivityEvent", 'ActivityEventType'>
    readonly actorId: FieldRef<"ActivityEvent", 'String'>
    readonly metadata: FieldRef<"ActivityEvent", 'Json'>
    readonly createdAt: FieldRef<"ActivityEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ActivityEvent findUnique
   */
  export type ActivityEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter, which ActivityEvent to fetch.
     */
    where: ActivityEventWhereUniqueInput
  }

  /**
   * ActivityEvent findUniqueOrThrow
   */
  export type ActivityEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter, which ActivityEvent to fetch.
     */
    where: ActivityEventWhereUniqueInput
  }

  /**
   * ActivityEvent findFirst
   */
  export type ActivityEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter, which ActivityEvent to fetch.
     */
    where?: ActivityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityEvents to fetch.
     */
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityEvents.
     */
    cursor?: ActivityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityEvents.
     */
    distinct?: ActivityEventScalarFieldEnum | ActivityEventScalarFieldEnum[]
  }

  /**
   * ActivityEvent findFirstOrThrow
   */
  export type ActivityEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter, which ActivityEvent to fetch.
     */
    where?: ActivityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityEvents to fetch.
     */
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityEvents.
     */
    cursor?: ActivityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityEvents.
     */
    distinct?: ActivityEventScalarFieldEnum | ActivityEventScalarFieldEnum[]
  }

  /**
   * ActivityEvent findMany
   */
  export type ActivityEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter, which ActivityEvents to fetch.
     */
    where?: ActivityEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityEvents to fetch.
     */
    orderBy?: ActivityEventOrderByWithRelationInput | ActivityEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivityEvents.
     */
    cursor?: ActivityEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityEvents.
     */
    skip?: number
    distinct?: ActivityEventScalarFieldEnum | ActivityEventScalarFieldEnum[]
  }

  /**
   * ActivityEvent create
   */
  export type ActivityEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * The data needed to create a ActivityEvent.
     */
    data: XOR<ActivityEventCreateInput, ActivityEventUncheckedCreateInput>
  }

  /**
   * ActivityEvent createMany
   */
  export type ActivityEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivityEvents.
     */
    data: ActivityEventCreateManyInput | ActivityEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ActivityEvent createManyAndReturn
   */
  export type ActivityEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * The data used to create many ActivityEvents.
     */
    data: ActivityEventCreateManyInput | ActivityEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityEvent update
   */
  export type ActivityEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * The data needed to update a ActivityEvent.
     */
    data: XOR<ActivityEventUpdateInput, ActivityEventUncheckedUpdateInput>
    /**
     * Choose, which ActivityEvent to update.
     */
    where: ActivityEventWhereUniqueInput
  }

  /**
   * ActivityEvent updateMany
   */
  export type ActivityEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivityEvents.
     */
    data: XOR<ActivityEventUpdateManyMutationInput, ActivityEventUncheckedUpdateManyInput>
    /**
     * Filter which ActivityEvents to update
     */
    where?: ActivityEventWhereInput
    /**
     * Limit how many ActivityEvents to update.
     */
    limit?: number
  }

  /**
   * ActivityEvent updateManyAndReturn
   */
  export type ActivityEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * The data used to update ActivityEvents.
     */
    data: XOR<ActivityEventUpdateManyMutationInput, ActivityEventUncheckedUpdateManyInput>
    /**
     * Filter which ActivityEvents to update
     */
    where?: ActivityEventWhereInput
    /**
     * Limit how many ActivityEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivityEvent upsert
   */
  export type ActivityEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * The filter to search for the ActivityEvent to update in case it exists.
     */
    where: ActivityEventWhereUniqueInput
    /**
     * In case the ActivityEvent found by the `where` argument doesn't exist, create a new ActivityEvent with this data.
     */
    create: XOR<ActivityEventCreateInput, ActivityEventUncheckedCreateInput>
    /**
     * In case the ActivityEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityEventUpdateInput, ActivityEventUncheckedUpdateInput>
  }

  /**
   * ActivityEvent delete
   */
  export type ActivityEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
    /**
     * Filter which ActivityEvent to delete.
     */
    where: ActivityEventWhereUniqueInput
  }

  /**
   * ActivityEvent deleteMany
   */
  export type ActivityEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityEvents to delete
     */
    where?: ActivityEventWhereInput
    /**
     * Limit how many ActivityEvents to delete.
     */
    limit?: number
  }

  /**
   * ActivityEvent.actor
   */
  export type ActivityEvent$actorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppUser
     */
    omit?: AppUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AppUserInclude<ExtArgs> | null
    where?: AppUserWhereInput
  }

  /**
   * ActivityEvent without action
   */
  export type ActivityEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityEvent
     */
    select?: ActivityEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityEvent
     */
    omit?: ActivityEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityEventInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    slug: 'slug',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const AppUserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    fullName: 'fullName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AppUserScalarFieldEnum = (typeof AppUserScalarFieldEnum)[keyof typeof AppUserScalarFieldEnum]


  export const MembershipScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    userId: 'userId',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MembershipScalarFieldEnum = (typeof MembershipScalarFieldEnum)[keyof typeof MembershipScalarFieldEnum]


  export const OutcomeScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    key: 'key',
    title: 'title',
    problemStatement: 'problemStatement',
    outcomeStatement: 'outcomeStatement',
    baselineDefinition: 'baselineDefinition',
    baselineSource: 'baselineSource',
    timeframe: 'timeframe',
    valueOwnerId: 'valueOwnerId',
    riskProfile: 'riskProfile',
    aiAccelerationLevel: 'aiAccelerationLevel',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OutcomeScalarFieldEnum = (typeof OutcomeScalarFieldEnum)[keyof typeof OutcomeScalarFieldEnum]


  export const EpicScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    outcomeId: 'outcomeId',
    key: 'key',
    title: 'title',
    purpose: 'purpose',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EpicScalarFieldEnum = (typeof EpicScalarFieldEnum)[keyof typeof EpicScalarFieldEnum]


  export const StoryScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    outcomeId: 'outcomeId',
    epicId: 'epicId',
    key: 'key',
    title: 'title',
    storyType: 'storyType',
    valueIntent: 'valueIntent',
    acceptanceCriteria: 'acceptanceCriteria',
    aiUsageScope: 'aiUsageScope',
    aiAccelerationLevel: 'aiAccelerationLevel',
    testDefinition: 'testDefinition',
    definitionOfDone: 'definitionOfDone',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StoryScalarFieldEnum = (typeof StoryScalarFieldEnum)[keyof typeof StoryScalarFieldEnum]


  export const TollgateScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    entityType: 'entityType',
    entityId: 'entityId',
    tollgateType: 'tollgateType',
    status: 'status',
    blockers: 'blockers',
    approverRoles: 'approverRoles',
    decidedBy: 'decidedBy',
    decidedAt: 'decidedAt',
    comments: 'comments',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TollgateScalarFieldEnum = (typeof TollgateScalarFieldEnum)[keyof typeof TollgateScalarFieldEnum]


  export const ActivityEventScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    entityType: 'entityType',
    entityId: 'entityId',
    eventType: 'eventType',
    actorId: 'actorId',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type ActivityEventScalarFieldEnum = (typeof ActivityEventScalarFieldEnum)[keyof typeof ActivityEventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'MembershipRole'
   */
  export type EnumMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MembershipRole'>
    


  /**
   * Reference to a field of type 'MembershipRole[]'
   */
  export type ListEnumMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MembershipRole[]'>
    


  /**
   * Reference to a field of type 'RiskProfile'
   */
  export type EnumRiskProfileFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskProfile'>
    


  /**
   * Reference to a field of type 'RiskProfile[]'
   */
  export type ListEnumRiskProfileFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RiskProfile[]'>
    


  /**
   * Reference to a field of type 'AiAccelerationLevel'
   */
  export type EnumAiAccelerationLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AiAccelerationLevel'>
    


  /**
   * Reference to a field of type 'AiAccelerationLevel[]'
   */
  export type ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AiAccelerationLevel[]'>
    


  /**
   * Reference to a field of type 'OutcomeStatus'
   */
  export type EnumOutcomeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutcomeStatus'>
    


  /**
   * Reference to a field of type 'OutcomeStatus[]'
   */
  export type ListEnumOutcomeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OutcomeStatus[]'>
    


  /**
   * Reference to a field of type 'EpicStatus'
   */
  export type EnumEpicStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EpicStatus'>
    


  /**
   * Reference to a field of type 'EpicStatus[]'
   */
  export type ListEnumEpicStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EpicStatus[]'>
    


  /**
   * Reference to a field of type 'StoryType'
   */
  export type EnumStoryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoryType'>
    


  /**
   * Reference to a field of type 'StoryType[]'
   */
  export type ListEnumStoryTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoryType[]'>
    


  /**
   * Reference to a field of type 'StoryStatus'
   */
  export type EnumStoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoryStatus'>
    


  /**
   * Reference to a field of type 'StoryStatus[]'
   */
  export type ListEnumStoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StoryStatus[]'>
    


  /**
   * Reference to a field of type 'TollgateEntityType'
   */
  export type EnumTollgateEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateEntityType'>
    


  /**
   * Reference to a field of type 'TollgateEntityType[]'
   */
  export type ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateEntityType[]'>
    


  /**
   * Reference to a field of type 'TollgateType'
   */
  export type EnumTollgateTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateType'>
    


  /**
   * Reference to a field of type 'TollgateType[]'
   */
  export type ListEnumTollgateTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateType[]'>
    


  /**
   * Reference to a field of type 'TollgateStatus'
   */
  export type EnumTollgateStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateStatus'>
    


  /**
   * Reference to a field of type 'TollgateStatus[]'
   */
  export type ListEnumTollgateStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TollgateStatus[]'>
    


  /**
   * Reference to a field of type 'ActivityEntityType'
   */
  export type EnumActivityEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityEntityType'>
    


  /**
   * Reference to a field of type 'ActivityEntityType[]'
   */
  export type ListEnumActivityEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityEntityType[]'>
    


  /**
   * Reference to a field of type 'ActivityEventType'
   */
  export type EnumActivityEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityEventType'>
    


  /**
   * Reference to a field of type 'ActivityEventType[]'
   */
  export type ListEnumActivityEventTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ActivityEventType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    slug?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    memberships?: MembershipListRelationFilter
    outcomes?: OutcomeListRelationFilter
    epics?: EpicListRelationFilter
    stories?: StoryListRelationFilter
    tollgates?: TollgateListRelationFilter
    activityEvents?: ActivityEventListRelationFilter
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    memberships?: MembershipOrderByRelationAggregateInput
    outcomes?: OutcomeOrderByRelationAggregateInput
    epics?: EpicOrderByRelationAggregateInput
    stories?: StoryOrderByRelationAggregateInput
    tollgates?: TollgateOrderByRelationAggregateInput
    activityEvents?: ActivityEventOrderByRelationAggregateInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    memberships?: MembershipListRelationFilter
    outcomes?: OutcomeListRelationFilter
    epics?: EpicListRelationFilter
    stories?: StoryListRelationFilter
    tollgates?: TollgateListRelationFilter
    activityEvents?: ActivityEventListRelationFilter
  }, "id" | "slug">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    slug?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
  }

  export type AppUserWhereInput = {
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    id?: StringFilter<"AppUser"> | string
    email?: StringFilter<"AppUser"> | string
    fullName?: StringNullableFilter<"AppUser"> | string | null
    createdAt?: DateTimeFilter<"AppUser"> | Date | string
    updatedAt?: DateTimeFilter<"AppUser"> | Date | string
    memberships?: MembershipListRelationFilter
    ownedOutcomes?: OutcomeListRelationFilter
    tollgateDecisions?: TollgateListRelationFilter
    activityEvents?: ActivityEventListRelationFilter
  }

  export type AppUserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    memberships?: MembershipOrderByRelationAggregateInput
    ownedOutcomes?: OutcomeOrderByRelationAggregateInput
    tollgateDecisions?: TollgateOrderByRelationAggregateInput
    activityEvents?: ActivityEventOrderByRelationAggregateInput
  }

  export type AppUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    fullName?: StringNullableFilter<"AppUser"> | string | null
    createdAt?: DateTimeFilter<"AppUser"> | Date | string
    updatedAt?: DateTimeFilter<"AppUser"> | Date | string
    memberships?: MembershipListRelationFilter
    ownedOutcomes?: OutcomeListRelationFilter
    tollgateDecisions?: TollgateListRelationFilter
    activityEvents?: ActivityEventListRelationFilter
  }, "id" | "email">

  export type AppUserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AppUserCountOrderByAggregateInput
    _max?: AppUserMaxOrderByAggregateInput
    _min?: AppUserMinOrderByAggregateInput
  }

  export type AppUserScalarWhereWithAggregatesInput = {
    AND?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    OR?: AppUserScalarWhereWithAggregatesInput[]
    NOT?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AppUser"> | string
    email?: StringWithAggregatesFilter<"AppUser"> | string
    fullName?: StringNullableWithAggregatesFilter<"AppUser"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AppUser"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AppUser"> | Date | string
  }

  export type MembershipWhereInput = {
    AND?: MembershipWhereInput | MembershipWhereInput[]
    OR?: MembershipWhereInput[]
    NOT?: MembershipWhereInput | MembershipWhereInput[]
    id?: StringFilter<"Membership"> | string
    organizationId?: StringFilter<"Membership"> | string
    userId?: StringFilter<"Membership"> | string
    role?: EnumMembershipRoleFilter<"Membership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"Membership"> | Date | string
    updatedAt?: DateTimeFilter<"Membership"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    user?: XOR<AppUserScalarRelationFilter, AppUserWhereInput>
  }

  export type MembershipOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    user?: AppUserOrderByWithRelationInput
  }

  export type MembershipWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_userId?: MembershipOrganizationIdUserIdCompoundUniqueInput
    AND?: MembershipWhereInput | MembershipWhereInput[]
    OR?: MembershipWhereInput[]
    NOT?: MembershipWhereInput | MembershipWhereInput[]
    organizationId?: StringFilter<"Membership"> | string
    userId?: StringFilter<"Membership"> | string
    role?: EnumMembershipRoleFilter<"Membership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"Membership"> | Date | string
    updatedAt?: DateTimeFilter<"Membership"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    user?: XOR<AppUserScalarRelationFilter, AppUserWhereInput>
  }, "id" | "organizationId_userId">

  export type MembershipOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MembershipCountOrderByAggregateInput
    _max?: MembershipMaxOrderByAggregateInput
    _min?: MembershipMinOrderByAggregateInput
  }

  export type MembershipScalarWhereWithAggregatesInput = {
    AND?: MembershipScalarWhereWithAggregatesInput | MembershipScalarWhereWithAggregatesInput[]
    OR?: MembershipScalarWhereWithAggregatesInput[]
    NOT?: MembershipScalarWhereWithAggregatesInput | MembershipScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Membership"> | string
    organizationId?: StringWithAggregatesFilter<"Membership"> | string
    userId?: StringWithAggregatesFilter<"Membership"> | string
    role?: EnumMembershipRoleWithAggregatesFilter<"Membership"> | $Enums.MembershipRole
    createdAt?: DateTimeWithAggregatesFilter<"Membership"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Membership"> | Date | string
  }

  export type OutcomeWhereInput = {
    AND?: OutcomeWhereInput | OutcomeWhereInput[]
    OR?: OutcomeWhereInput[]
    NOT?: OutcomeWhereInput | OutcomeWhereInput[]
    id?: StringFilter<"Outcome"> | string
    organizationId?: StringFilter<"Outcome"> | string
    key?: StringFilter<"Outcome"> | string
    title?: StringFilter<"Outcome"> | string
    problemStatement?: StringNullableFilter<"Outcome"> | string | null
    outcomeStatement?: StringNullableFilter<"Outcome"> | string | null
    baselineDefinition?: StringNullableFilter<"Outcome"> | string | null
    baselineSource?: StringNullableFilter<"Outcome"> | string | null
    timeframe?: StringNullableFilter<"Outcome"> | string | null
    valueOwnerId?: StringNullableFilter<"Outcome"> | string | null
    riskProfile?: EnumRiskProfileFilter<"Outcome"> | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Outcome"> | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFilter<"Outcome"> | $Enums.OutcomeStatus
    createdAt?: DateTimeFilter<"Outcome"> | Date | string
    updatedAt?: DateTimeFilter<"Outcome"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    valueOwner?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
    epics?: EpicListRelationFilter
    stories?: StoryListRelationFilter
  }

  export type OutcomeOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    problemStatement?: SortOrderInput | SortOrder
    outcomeStatement?: SortOrderInput | SortOrder
    baselineDefinition?: SortOrderInput | SortOrder
    baselineSource?: SortOrderInput | SortOrder
    timeframe?: SortOrderInput | SortOrder
    valueOwnerId?: SortOrderInput | SortOrder
    riskProfile?: SortOrder
    aiAccelerationLevel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    valueOwner?: AppUserOrderByWithRelationInput
    epics?: EpicOrderByRelationAggregateInput
    stories?: StoryOrderByRelationAggregateInput
  }

  export type OutcomeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_key?: OutcomeOrganizationIdKeyCompoundUniqueInput
    AND?: OutcomeWhereInput | OutcomeWhereInput[]
    OR?: OutcomeWhereInput[]
    NOT?: OutcomeWhereInput | OutcomeWhereInput[]
    organizationId?: StringFilter<"Outcome"> | string
    key?: StringFilter<"Outcome"> | string
    title?: StringFilter<"Outcome"> | string
    problemStatement?: StringNullableFilter<"Outcome"> | string | null
    outcomeStatement?: StringNullableFilter<"Outcome"> | string | null
    baselineDefinition?: StringNullableFilter<"Outcome"> | string | null
    baselineSource?: StringNullableFilter<"Outcome"> | string | null
    timeframe?: StringNullableFilter<"Outcome"> | string | null
    valueOwnerId?: StringNullableFilter<"Outcome"> | string | null
    riskProfile?: EnumRiskProfileFilter<"Outcome"> | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Outcome"> | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFilter<"Outcome"> | $Enums.OutcomeStatus
    createdAt?: DateTimeFilter<"Outcome"> | Date | string
    updatedAt?: DateTimeFilter<"Outcome"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    valueOwner?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
    epics?: EpicListRelationFilter
    stories?: StoryListRelationFilter
  }, "id" | "organizationId_key">

  export type OutcomeOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    problemStatement?: SortOrderInput | SortOrder
    outcomeStatement?: SortOrderInput | SortOrder
    baselineDefinition?: SortOrderInput | SortOrder
    baselineSource?: SortOrderInput | SortOrder
    timeframe?: SortOrderInput | SortOrder
    valueOwnerId?: SortOrderInput | SortOrder
    riskProfile?: SortOrder
    aiAccelerationLevel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OutcomeCountOrderByAggregateInput
    _max?: OutcomeMaxOrderByAggregateInput
    _min?: OutcomeMinOrderByAggregateInput
  }

  export type OutcomeScalarWhereWithAggregatesInput = {
    AND?: OutcomeScalarWhereWithAggregatesInput | OutcomeScalarWhereWithAggregatesInput[]
    OR?: OutcomeScalarWhereWithAggregatesInput[]
    NOT?: OutcomeScalarWhereWithAggregatesInput | OutcomeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Outcome"> | string
    organizationId?: StringWithAggregatesFilter<"Outcome"> | string
    key?: StringWithAggregatesFilter<"Outcome"> | string
    title?: StringWithAggregatesFilter<"Outcome"> | string
    problemStatement?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    outcomeStatement?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    baselineDefinition?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    baselineSource?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    timeframe?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    valueOwnerId?: StringNullableWithAggregatesFilter<"Outcome"> | string | null
    riskProfile?: EnumRiskProfileWithAggregatesFilter<"Outcome"> | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelWithAggregatesFilter<"Outcome"> | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusWithAggregatesFilter<"Outcome"> | $Enums.OutcomeStatus
    createdAt?: DateTimeWithAggregatesFilter<"Outcome"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Outcome"> | Date | string
  }

  export type EpicWhereInput = {
    AND?: EpicWhereInput | EpicWhereInput[]
    OR?: EpicWhereInput[]
    NOT?: EpicWhereInput | EpicWhereInput[]
    id?: StringFilter<"Epic"> | string
    organizationId?: StringFilter<"Epic"> | string
    outcomeId?: StringFilter<"Epic"> | string
    key?: StringFilter<"Epic"> | string
    title?: StringFilter<"Epic"> | string
    purpose?: StringFilter<"Epic"> | string
    status?: EnumEpicStatusFilter<"Epic"> | $Enums.EpicStatus
    createdAt?: DateTimeFilter<"Epic"> | Date | string
    updatedAt?: DateTimeFilter<"Epic"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    outcome?: XOR<OutcomeScalarRelationFilter, OutcomeWhereInput>
    stories?: StoryListRelationFilter
  }

  export type EpicOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    purpose?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    outcome?: OutcomeOrderByWithRelationInput
    stories?: StoryOrderByRelationAggregateInput
  }

  export type EpicWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_key?: EpicOrganizationIdKeyCompoundUniqueInput
    AND?: EpicWhereInput | EpicWhereInput[]
    OR?: EpicWhereInput[]
    NOT?: EpicWhereInput | EpicWhereInput[]
    organizationId?: StringFilter<"Epic"> | string
    outcomeId?: StringFilter<"Epic"> | string
    key?: StringFilter<"Epic"> | string
    title?: StringFilter<"Epic"> | string
    purpose?: StringFilter<"Epic"> | string
    status?: EnumEpicStatusFilter<"Epic"> | $Enums.EpicStatus
    createdAt?: DateTimeFilter<"Epic"> | Date | string
    updatedAt?: DateTimeFilter<"Epic"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    outcome?: XOR<OutcomeScalarRelationFilter, OutcomeWhereInput>
    stories?: StoryListRelationFilter
  }, "id" | "organizationId_key">

  export type EpicOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    purpose?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EpicCountOrderByAggregateInput
    _max?: EpicMaxOrderByAggregateInput
    _min?: EpicMinOrderByAggregateInput
  }

  export type EpicScalarWhereWithAggregatesInput = {
    AND?: EpicScalarWhereWithAggregatesInput | EpicScalarWhereWithAggregatesInput[]
    OR?: EpicScalarWhereWithAggregatesInput[]
    NOT?: EpicScalarWhereWithAggregatesInput | EpicScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Epic"> | string
    organizationId?: StringWithAggregatesFilter<"Epic"> | string
    outcomeId?: StringWithAggregatesFilter<"Epic"> | string
    key?: StringWithAggregatesFilter<"Epic"> | string
    title?: StringWithAggregatesFilter<"Epic"> | string
    purpose?: StringWithAggregatesFilter<"Epic"> | string
    status?: EnumEpicStatusWithAggregatesFilter<"Epic"> | $Enums.EpicStatus
    createdAt?: DateTimeWithAggregatesFilter<"Epic"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Epic"> | Date | string
  }

  export type StoryWhereInput = {
    AND?: StoryWhereInput | StoryWhereInput[]
    OR?: StoryWhereInput[]
    NOT?: StoryWhereInput | StoryWhereInput[]
    id?: StringFilter<"Story"> | string
    organizationId?: StringFilter<"Story"> | string
    outcomeId?: StringFilter<"Story"> | string
    epicId?: StringFilter<"Story"> | string
    key?: StringFilter<"Story"> | string
    title?: StringFilter<"Story"> | string
    storyType?: EnumStoryTypeFilter<"Story"> | $Enums.StoryType
    valueIntent?: StringFilter<"Story"> | string
    acceptanceCriteria?: StringNullableListFilter<"Story">
    aiUsageScope?: StringNullableListFilter<"Story">
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Story"> | $Enums.AiAccelerationLevel
    testDefinition?: StringNullableFilter<"Story"> | string | null
    definitionOfDone?: StringNullableListFilter<"Story">
    status?: EnumStoryStatusFilter<"Story"> | $Enums.StoryStatus
    createdAt?: DateTimeFilter<"Story"> | Date | string
    updatedAt?: DateTimeFilter<"Story"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    outcome?: XOR<OutcomeScalarRelationFilter, OutcomeWhereInput>
    epic?: XOR<EpicScalarRelationFilter, EpicWhereInput>
  }

  export type StoryOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    epicId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    storyType?: SortOrder
    valueIntent?: SortOrder
    acceptanceCriteria?: SortOrder
    aiUsageScope?: SortOrder
    aiAccelerationLevel?: SortOrder
    testDefinition?: SortOrderInput | SortOrder
    definitionOfDone?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    outcome?: OutcomeOrderByWithRelationInput
    epic?: EpicOrderByWithRelationInput
  }

  export type StoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_key?: StoryOrganizationIdKeyCompoundUniqueInput
    AND?: StoryWhereInput | StoryWhereInput[]
    OR?: StoryWhereInput[]
    NOT?: StoryWhereInput | StoryWhereInput[]
    organizationId?: StringFilter<"Story"> | string
    outcomeId?: StringFilter<"Story"> | string
    epicId?: StringFilter<"Story"> | string
    key?: StringFilter<"Story"> | string
    title?: StringFilter<"Story"> | string
    storyType?: EnumStoryTypeFilter<"Story"> | $Enums.StoryType
    valueIntent?: StringFilter<"Story"> | string
    acceptanceCriteria?: StringNullableListFilter<"Story">
    aiUsageScope?: StringNullableListFilter<"Story">
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Story"> | $Enums.AiAccelerationLevel
    testDefinition?: StringNullableFilter<"Story"> | string | null
    definitionOfDone?: StringNullableListFilter<"Story">
    status?: EnumStoryStatusFilter<"Story"> | $Enums.StoryStatus
    createdAt?: DateTimeFilter<"Story"> | Date | string
    updatedAt?: DateTimeFilter<"Story"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    outcome?: XOR<OutcomeScalarRelationFilter, OutcomeWhereInput>
    epic?: XOR<EpicScalarRelationFilter, EpicWhereInput>
  }, "id" | "organizationId_key">

  export type StoryOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    epicId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    storyType?: SortOrder
    valueIntent?: SortOrder
    acceptanceCriteria?: SortOrder
    aiUsageScope?: SortOrder
    aiAccelerationLevel?: SortOrder
    testDefinition?: SortOrderInput | SortOrder
    definitionOfDone?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StoryCountOrderByAggregateInput
    _max?: StoryMaxOrderByAggregateInput
    _min?: StoryMinOrderByAggregateInput
  }

  export type StoryScalarWhereWithAggregatesInput = {
    AND?: StoryScalarWhereWithAggregatesInput | StoryScalarWhereWithAggregatesInput[]
    OR?: StoryScalarWhereWithAggregatesInput[]
    NOT?: StoryScalarWhereWithAggregatesInput | StoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Story"> | string
    organizationId?: StringWithAggregatesFilter<"Story"> | string
    outcomeId?: StringWithAggregatesFilter<"Story"> | string
    epicId?: StringWithAggregatesFilter<"Story"> | string
    key?: StringWithAggregatesFilter<"Story"> | string
    title?: StringWithAggregatesFilter<"Story"> | string
    storyType?: EnumStoryTypeWithAggregatesFilter<"Story"> | $Enums.StoryType
    valueIntent?: StringWithAggregatesFilter<"Story"> | string
    acceptanceCriteria?: StringNullableListFilter<"Story">
    aiUsageScope?: StringNullableListFilter<"Story">
    aiAccelerationLevel?: EnumAiAccelerationLevelWithAggregatesFilter<"Story"> | $Enums.AiAccelerationLevel
    testDefinition?: StringNullableWithAggregatesFilter<"Story"> | string | null
    definitionOfDone?: StringNullableListFilter<"Story">
    status?: EnumStoryStatusWithAggregatesFilter<"Story"> | $Enums.StoryStatus
    createdAt?: DateTimeWithAggregatesFilter<"Story"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Story"> | Date | string
  }

  export type TollgateWhereInput = {
    AND?: TollgateWhereInput | TollgateWhereInput[]
    OR?: TollgateWhereInput[]
    NOT?: TollgateWhereInput | TollgateWhereInput[]
    id?: StringFilter<"Tollgate"> | string
    organizationId?: StringFilter<"Tollgate"> | string
    entityType?: EnumTollgateEntityTypeFilter<"Tollgate"> | $Enums.TollgateEntityType
    entityId?: StringFilter<"Tollgate"> | string
    tollgateType?: EnumTollgateTypeFilter<"Tollgate"> | $Enums.TollgateType
    status?: EnumTollgateStatusFilter<"Tollgate"> | $Enums.TollgateStatus
    blockers?: StringNullableListFilter<"Tollgate">
    approverRoles?: EnumMembershipRoleNullableListFilter<"Tollgate">
    decidedBy?: StringNullableFilter<"Tollgate"> | string | null
    decidedAt?: DateTimeNullableFilter<"Tollgate"> | Date | string | null
    comments?: StringNullableFilter<"Tollgate"> | string | null
    createdAt?: DateTimeFilter<"Tollgate"> | Date | string
    updatedAt?: DateTimeFilter<"Tollgate"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    decisionActor?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
  }

  export type TollgateOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    tollgateType?: SortOrder
    status?: SortOrder
    blockers?: SortOrder
    approverRoles?: SortOrder
    decidedBy?: SortOrderInput | SortOrder
    decidedAt?: SortOrderInput | SortOrder
    comments?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    decisionActor?: AppUserOrderByWithRelationInput
  }

  export type TollgateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_entityType_entityId_tollgateType?: TollgateOrganizationIdEntityTypeEntityIdTollgateTypeCompoundUniqueInput
    AND?: TollgateWhereInput | TollgateWhereInput[]
    OR?: TollgateWhereInput[]
    NOT?: TollgateWhereInput | TollgateWhereInput[]
    organizationId?: StringFilter<"Tollgate"> | string
    entityType?: EnumTollgateEntityTypeFilter<"Tollgate"> | $Enums.TollgateEntityType
    entityId?: StringFilter<"Tollgate"> | string
    tollgateType?: EnumTollgateTypeFilter<"Tollgate"> | $Enums.TollgateType
    status?: EnumTollgateStatusFilter<"Tollgate"> | $Enums.TollgateStatus
    blockers?: StringNullableListFilter<"Tollgate">
    approverRoles?: EnumMembershipRoleNullableListFilter<"Tollgate">
    decidedBy?: StringNullableFilter<"Tollgate"> | string | null
    decidedAt?: DateTimeNullableFilter<"Tollgate"> | Date | string | null
    comments?: StringNullableFilter<"Tollgate"> | string | null
    createdAt?: DateTimeFilter<"Tollgate"> | Date | string
    updatedAt?: DateTimeFilter<"Tollgate"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    decisionActor?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
  }, "id" | "organizationId_entityType_entityId_tollgateType">

  export type TollgateOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    tollgateType?: SortOrder
    status?: SortOrder
    blockers?: SortOrder
    approverRoles?: SortOrder
    decidedBy?: SortOrderInput | SortOrder
    decidedAt?: SortOrderInput | SortOrder
    comments?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TollgateCountOrderByAggregateInput
    _max?: TollgateMaxOrderByAggregateInput
    _min?: TollgateMinOrderByAggregateInput
  }

  export type TollgateScalarWhereWithAggregatesInput = {
    AND?: TollgateScalarWhereWithAggregatesInput | TollgateScalarWhereWithAggregatesInput[]
    OR?: TollgateScalarWhereWithAggregatesInput[]
    NOT?: TollgateScalarWhereWithAggregatesInput | TollgateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tollgate"> | string
    organizationId?: StringWithAggregatesFilter<"Tollgate"> | string
    entityType?: EnumTollgateEntityTypeWithAggregatesFilter<"Tollgate"> | $Enums.TollgateEntityType
    entityId?: StringWithAggregatesFilter<"Tollgate"> | string
    tollgateType?: EnumTollgateTypeWithAggregatesFilter<"Tollgate"> | $Enums.TollgateType
    status?: EnumTollgateStatusWithAggregatesFilter<"Tollgate"> | $Enums.TollgateStatus
    blockers?: StringNullableListFilter<"Tollgate">
    approverRoles?: EnumMembershipRoleNullableListFilter<"Tollgate">
    decidedBy?: StringNullableWithAggregatesFilter<"Tollgate"> | string | null
    decidedAt?: DateTimeNullableWithAggregatesFilter<"Tollgate"> | Date | string | null
    comments?: StringNullableWithAggregatesFilter<"Tollgate"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Tollgate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tollgate"> | Date | string
  }

  export type ActivityEventWhereInput = {
    AND?: ActivityEventWhereInput | ActivityEventWhereInput[]
    OR?: ActivityEventWhereInput[]
    NOT?: ActivityEventWhereInput | ActivityEventWhereInput[]
    id?: StringFilter<"ActivityEvent"> | string
    organizationId?: StringFilter<"ActivityEvent"> | string
    entityType?: EnumActivityEntityTypeFilter<"ActivityEvent"> | $Enums.ActivityEntityType
    entityId?: StringFilter<"ActivityEvent"> | string
    eventType?: EnumActivityEventTypeFilter<"ActivityEvent"> | $Enums.ActivityEventType
    actorId?: StringNullableFilter<"ActivityEvent"> | string | null
    metadata?: JsonNullableFilter<"ActivityEvent">
    createdAt?: DateTimeFilter<"ActivityEvent"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    actor?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
  }

  export type ActivityEventOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
    actor?: AppUserOrderByWithRelationInput
  }

  export type ActivityEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityEventWhereInput | ActivityEventWhereInput[]
    OR?: ActivityEventWhereInput[]
    NOT?: ActivityEventWhereInput | ActivityEventWhereInput[]
    organizationId?: StringFilter<"ActivityEvent"> | string
    entityType?: EnumActivityEntityTypeFilter<"ActivityEvent"> | $Enums.ActivityEntityType
    entityId?: StringFilter<"ActivityEvent"> | string
    eventType?: EnumActivityEventTypeFilter<"ActivityEvent"> | $Enums.ActivityEventType
    actorId?: StringNullableFilter<"ActivityEvent"> | string | null
    metadata?: JsonNullableFilter<"ActivityEvent">
    createdAt?: DateTimeFilter<"ActivityEvent"> | Date | string
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
    actor?: XOR<AppUserNullableScalarRelationFilter, AppUserWhereInput> | null
  }, "id">

  export type ActivityEventOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ActivityEventCountOrderByAggregateInput
    _max?: ActivityEventMaxOrderByAggregateInput
    _min?: ActivityEventMinOrderByAggregateInput
  }

  export type ActivityEventScalarWhereWithAggregatesInput = {
    AND?: ActivityEventScalarWhereWithAggregatesInput | ActivityEventScalarWhereWithAggregatesInput[]
    OR?: ActivityEventScalarWhereWithAggregatesInput[]
    NOT?: ActivityEventScalarWhereWithAggregatesInput | ActivityEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivityEvent"> | string
    organizationId?: StringWithAggregatesFilter<"ActivityEvent"> | string
    entityType?: EnumActivityEntityTypeWithAggregatesFilter<"ActivityEvent"> | $Enums.ActivityEntityType
    entityId?: StringWithAggregatesFilter<"ActivityEvent"> | string
    eventType?: EnumActivityEventTypeWithAggregatesFilter<"ActivityEvent"> | $Enums.ActivityEventType
    actorId?: StringNullableWithAggregatesFilter<"ActivityEvent"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"ActivityEvent">
    createdAt?: DateTimeWithAggregatesFilter<"ActivityEvent"> | Date | string
  }

  export type OrganizationCreateInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserCreateInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventCreateNestedManyWithoutActorInput
  }

  export type AppUserUncheckedCreateInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeUncheckedCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateUncheckedCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutActorInput
  }

  export type AppUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutActorNestedInput
  }

  export type AppUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUncheckedUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUncheckedUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type AppUserCreateManyInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipCreateInput = {
    id: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutMembershipsInput
    user: AppUserCreateNestedOneWithoutMembershipsInput
  }

  export type MembershipUncheckedCreateInput = {
    id: string
    organizationId: string
    userId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MembershipUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutMembershipsNestedInput
    user?: AppUserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MembershipUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipCreateManyInput = {
    id: string
    organizationId: string
    userId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MembershipUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeCreateInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutOutcomesInput
    valueOwner?: AppUserCreateNestedOneWithoutOwnedOutcomesInput
    epics?: EpicCreateNestedManyWithoutOutcomeInput
    stories?: StoryCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUncheckedCreateInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    epics?: EpicUncheckedCreateNestedManyWithoutOutcomeInput
    stories?: StoryUncheckedCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutOutcomesNestedInput
    valueOwner?: AppUserUpdateOneWithoutOwnedOutcomesNestedInput
    epics?: EpicUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    epics?: EpicUncheckedUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeCreateManyInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutcomeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicCreateInput = {
    id: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEpicsInput
    outcome: OutcomeCreateNestedOneWithoutEpicsInput
    stories?: StoryCreateNestedManyWithoutEpicInput
  }

  export type EpicUncheckedCreateInput = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stories?: StoryUncheckedCreateNestedManyWithoutEpicInput
  }

  export type EpicUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEpicsNestedInput
    outcome?: OutcomeUpdateOneRequiredWithoutEpicsNestedInput
    stories?: StoryUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stories?: StoryUncheckedUpdateManyWithoutEpicNestedInput
  }

  export type EpicCreateManyInput = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EpicUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryCreateInput = {
    id: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutStoriesInput
    outcome: OutcomeCreateNestedOneWithoutStoriesInput
    epic: EpicCreateNestedOneWithoutStoriesInput
  }

  export type StoryUncheckedCreateInput = {
    id: string
    organizationId: string
    outcomeId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutStoriesNestedInput
    outcome?: OutcomeUpdateOneRequiredWithoutStoriesNestedInput
    epic?: EpicUpdateOneRequiredWithoutStoriesNestedInput
  }

  export type StoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryCreateManyInput = {
    id: string
    organizationId: string
    outcomeId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateCreateInput = {
    id: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutTollgatesInput
    decisionActor?: AppUserCreateNestedOneWithoutTollgateDecisionsInput
  }

  export type TollgateUncheckedCreateInput = {
    id: string
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: string | null
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutTollgatesNestedInput
    decisionActor?: AppUserUpdateOneWithoutTollgateDecisionsNestedInput
  }

  export type TollgateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: NullableStringFieldUpdateOperationsInput | string | null
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateCreateManyInput = {
    id: string
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: string | null
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: NullableStringFieldUpdateOperationsInput | string | null
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventCreateInput = {
    id: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutActivityEventsInput
    actor?: AppUserCreateNestedOneWithoutActivityEventsInput
  }

  export type ActivityEventUncheckedCreateInput = {
    id: string
    organizationId: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    actorId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutActivityEventsNestedInput
    actor?: AppUserUpdateOneWithoutActivityEventsNestedInput
  }

  export type ActivityEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventCreateManyInput = {
    id: string
    organizationId: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    actorId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type MembershipListRelationFilter = {
    every?: MembershipWhereInput
    some?: MembershipWhereInput
    none?: MembershipWhereInput
  }

  export type OutcomeListRelationFilter = {
    every?: OutcomeWhereInput
    some?: OutcomeWhereInput
    none?: OutcomeWhereInput
  }

  export type EpicListRelationFilter = {
    every?: EpicWhereInput
    some?: EpicWhereInput
    none?: EpicWhereInput
  }

  export type StoryListRelationFilter = {
    every?: StoryWhereInput
    some?: StoryWhereInput
    none?: StoryWhereInput
  }

  export type TollgateListRelationFilter = {
    every?: TollgateWhereInput
    some?: TollgateWhereInput
    none?: TollgateWhereInput
  }

  export type ActivityEventListRelationFilter = {
    every?: ActivityEventWhereInput
    some?: ActivityEventWhereInput
    none?: ActivityEventWhereInput
  }

  export type MembershipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutcomeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EpicOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TollgateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivityEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    slug?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AppUserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppUserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppUserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    fullName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleFilter<$PrismaModel> | $Enums.MembershipRole
  }

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type AppUserScalarRelationFilter = {
    is?: AppUserWhereInput
    isNot?: AppUserWhereInput
  }

  export type MembershipOrganizationIdUserIdCompoundUniqueInput = {
    organizationId: string
    userId: string
  }

  export type MembershipCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.MembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumMembershipRoleFilter<$PrismaModel>
  }

  export type EnumRiskProfileFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileFilter<$PrismaModel> | $Enums.RiskProfile
  }

  export type EnumAiAccelerationLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.AiAccelerationLevel | EnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAiAccelerationLevelFilter<$PrismaModel> | $Enums.AiAccelerationLevel
  }

  export type EnumOutcomeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusFilter<$PrismaModel> | $Enums.OutcomeStatus
  }

  export type AppUserNullableScalarRelationFilter = {
    is?: AppUserWhereInput | null
    isNot?: AppUserWhereInput | null
  }

  export type OutcomeOrganizationIdKeyCompoundUniqueInput = {
    organizationId: string
    key: string
  }

  export type OutcomeCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    problemStatement?: SortOrder
    outcomeStatement?: SortOrder
    baselineDefinition?: SortOrder
    baselineSource?: SortOrder
    timeframe?: SortOrder
    valueOwnerId?: SortOrder
    riskProfile?: SortOrder
    aiAccelerationLevel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutcomeMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    problemStatement?: SortOrder
    outcomeStatement?: SortOrder
    baselineDefinition?: SortOrder
    baselineSource?: SortOrder
    timeframe?: SortOrder
    valueOwnerId?: SortOrder
    riskProfile?: SortOrder
    aiAccelerationLevel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OutcomeMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    problemStatement?: SortOrder
    outcomeStatement?: SortOrder
    baselineDefinition?: SortOrder
    baselineSource?: SortOrder
    timeframe?: SortOrder
    valueOwnerId?: SortOrder
    riskProfile?: SortOrder
    aiAccelerationLevel?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumRiskProfileWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel> | $Enums.RiskProfile
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskProfileFilter<$PrismaModel>
    _max?: NestedEnumRiskProfileFilter<$PrismaModel>
  }

  export type EnumAiAccelerationLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AiAccelerationLevel | EnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAiAccelerationLevelWithAggregatesFilter<$PrismaModel> | $Enums.AiAccelerationLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAiAccelerationLevelFilter<$PrismaModel>
    _max?: NestedEnumAiAccelerationLevelFilter<$PrismaModel>
  }

  export type EnumOutcomeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutcomeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutcomeStatusFilter<$PrismaModel>
    _max?: NestedEnumOutcomeStatusFilter<$PrismaModel>
  }

  export type EnumEpicStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EpicStatus | EnumEpicStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEpicStatusFilter<$PrismaModel> | $Enums.EpicStatus
  }

  export type OutcomeScalarRelationFilter = {
    is?: OutcomeWhereInput
    isNot?: OutcomeWhereInput
  }

  export type EpicOrganizationIdKeyCompoundUniqueInput = {
    organizationId: string
    key: string
  }

  export type EpicCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    purpose?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EpicMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    purpose?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EpicMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    purpose?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumEpicStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EpicStatus | EnumEpicStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEpicStatusWithAggregatesFilter<$PrismaModel> | $Enums.EpicStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEpicStatusFilter<$PrismaModel>
    _max?: NestedEnumEpicStatusFilter<$PrismaModel>
  }

  export type EnumStoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryType | EnumStoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryTypeFilter<$PrismaModel> | $Enums.StoryType
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumStoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryStatus | EnumStoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryStatusFilter<$PrismaModel> | $Enums.StoryStatus
  }

  export type EpicScalarRelationFilter = {
    is?: EpicWhereInput
    isNot?: EpicWhereInput
  }

  export type StoryOrganizationIdKeyCompoundUniqueInput = {
    organizationId: string
    key: string
  }

  export type StoryCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    epicId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    storyType?: SortOrder
    valueIntent?: SortOrder
    acceptanceCriteria?: SortOrder
    aiUsageScope?: SortOrder
    aiAccelerationLevel?: SortOrder
    testDefinition?: SortOrder
    definitionOfDone?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StoryMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    epicId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    storyType?: SortOrder
    valueIntent?: SortOrder
    aiAccelerationLevel?: SortOrder
    testDefinition?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StoryMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    outcomeId?: SortOrder
    epicId?: SortOrder
    key?: SortOrder
    title?: SortOrder
    storyType?: SortOrder
    valueIntent?: SortOrder
    aiAccelerationLevel?: SortOrder
    testDefinition?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumStoryTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryType | EnumStoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryTypeWithAggregatesFilter<$PrismaModel> | $Enums.StoryType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoryTypeFilter<$PrismaModel>
    _max?: NestedEnumStoryTypeFilter<$PrismaModel>
  }

  export type EnumStoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryStatus | EnumStoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.StoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoryStatusFilter<$PrismaModel>
    _max?: NestedEnumStoryStatusFilter<$PrismaModel>
  }

  export type EnumTollgateEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateEntityType | EnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateEntityTypeFilter<$PrismaModel> | $Enums.TollgateEntityType
  }

  export type EnumTollgateTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateType | EnumTollgateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateTypeFilter<$PrismaModel> | $Enums.TollgateType
  }

  export type EnumTollgateStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateStatus | EnumTollgateStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateStatusFilter<$PrismaModel> | $Enums.TollgateStatus
  }

  export type EnumMembershipRoleNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel> | null
    has?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    hasSome?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type TollgateOrganizationIdEntityTypeEntityIdTollgateTypeCompoundUniqueInput = {
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
  }

  export type TollgateCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    tollgateType?: SortOrder
    status?: SortOrder
    blockers?: SortOrder
    approverRoles?: SortOrder
    decidedBy?: SortOrder
    decidedAt?: SortOrder
    comments?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TollgateMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    tollgateType?: SortOrder
    status?: SortOrder
    decidedBy?: SortOrder
    decidedAt?: SortOrder
    comments?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TollgateMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    tollgateType?: SortOrder
    status?: SortOrder
    decidedBy?: SortOrder
    decidedAt?: SortOrder
    comments?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumTollgateEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateEntityType | EnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.TollgateEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumTollgateEntityTypeFilter<$PrismaModel>
  }

  export type EnumTollgateTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateType | EnumTollgateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateTypeWithAggregatesFilter<$PrismaModel> | $Enums.TollgateType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateTypeFilter<$PrismaModel>
    _max?: NestedEnumTollgateTypeFilter<$PrismaModel>
  }

  export type EnumTollgateStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateStatus | EnumTollgateStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateStatusWithAggregatesFilter<$PrismaModel> | $Enums.TollgateStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateStatusFilter<$PrismaModel>
    _max?: NestedEnumTollgateStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumActivityEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEntityType | EnumActivityEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEntityTypeFilter<$PrismaModel> | $Enums.ActivityEntityType
  }

  export type EnumActivityEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEventType | EnumActivityEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEventTypeFilter<$PrismaModel> | $Enums.ActivityEventType
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ActivityEventCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityEventMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityEventMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    eventType?: SortOrder
    actorId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumActivityEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEntityType | EnumActivityEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumActivityEntityTypeFilter<$PrismaModel>
  }

  export type EnumActivityEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEventType | EnumActivityEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityEventTypeFilter<$PrismaModel>
    _max?: NestedEnumActivityEventTypeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type MembershipCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput> | MembershipCreateWithoutOrganizationInput[] | MembershipUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutOrganizationInput | MembershipCreateOrConnectWithoutOrganizationInput[]
    createMany?: MembershipCreateManyOrganizationInputEnvelope
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
  }

  export type OutcomeCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput> | OutcomeCreateWithoutOrganizationInput[] | OutcomeUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutOrganizationInput | OutcomeCreateOrConnectWithoutOrganizationInput[]
    createMany?: OutcomeCreateManyOrganizationInputEnvelope
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
  }

  export type EpicCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput> | EpicCreateWithoutOrganizationInput[] | EpicUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOrganizationInput | EpicCreateOrConnectWithoutOrganizationInput[]
    createMany?: EpicCreateManyOrganizationInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type StoryCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput> | StoryCreateWithoutOrganizationInput[] | StoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOrganizationInput | StoryCreateOrConnectWithoutOrganizationInput[]
    createMany?: StoryCreateManyOrganizationInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type TollgateCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput> | TollgateCreateWithoutOrganizationInput[] | TollgateUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutOrganizationInput | TollgateCreateOrConnectWithoutOrganizationInput[]
    createMany?: TollgateCreateManyOrganizationInputEnvelope
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
  }

  export type ActivityEventCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput> | ActivityEventCreateWithoutOrganizationInput[] | ActivityEventUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutOrganizationInput | ActivityEventCreateOrConnectWithoutOrganizationInput[]
    createMany?: ActivityEventCreateManyOrganizationInputEnvelope
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
  }

  export type MembershipUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput> | MembershipCreateWithoutOrganizationInput[] | MembershipUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutOrganizationInput | MembershipCreateOrConnectWithoutOrganizationInput[]
    createMany?: MembershipCreateManyOrganizationInputEnvelope
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
  }

  export type OutcomeUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput> | OutcomeCreateWithoutOrganizationInput[] | OutcomeUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutOrganizationInput | OutcomeCreateOrConnectWithoutOrganizationInput[]
    createMany?: OutcomeCreateManyOrganizationInputEnvelope
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
  }

  export type EpicUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput> | EpicCreateWithoutOrganizationInput[] | EpicUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOrganizationInput | EpicCreateOrConnectWithoutOrganizationInput[]
    createMany?: EpicCreateManyOrganizationInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type StoryUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput> | StoryCreateWithoutOrganizationInput[] | StoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOrganizationInput | StoryCreateOrConnectWithoutOrganizationInput[]
    createMany?: StoryCreateManyOrganizationInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type TollgateUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput> | TollgateCreateWithoutOrganizationInput[] | TollgateUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutOrganizationInput | TollgateCreateOrConnectWithoutOrganizationInput[]
    createMany?: TollgateCreateManyOrganizationInputEnvelope
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
  }

  export type ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput> | ActivityEventCreateWithoutOrganizationInput[] | ActivityEventUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutOrganizationInput | ActivityEventCreateOrConnectWithoutOrganizationInput[]
    createMany?: ActivityEventCreateManyOrganizationInputEnvelope
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type MembershipUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput> | MembershipCreateWithoutOrganizationInput[] | MembershipUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutOrganizationInput | MembershipCreateOrConnectWithoutOrganizationInput[]
    upsert?: MembershipUpsertWithWhereUniqueWithoutOrganizationInput | MembershipUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: MembershipCreateManyOrganizationInputEnvelope
    set?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    disconnect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    delete?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    update?: MembershipUpdateWithWhereUniqueWithoutOrganizationInput | MembershipUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: MembershipUpdateManyWithWhereWithoutOrganizationInput | MembershipUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
  }

  export type OutcomeUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput> | OutcomeCreateWithoutOrganizationInput[] | OutcomeUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutOrganizationInput | OutcomeCreateOrConnectWithoutOrganizationInput[]
    upsert?: OutcomeUpsertWithWhereUniqueWithoutOrganizationInput | OutcomeUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OutcomeCreateManyOrganizationInputEnvelope
    set?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    disconnect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    delete?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    update?: OutcomeUpdateWithWhereUniqueWithoutOrganizationInput | OutcomeUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OutcomeUpdateManyWithWhereWithoutOrganizationInput | OutcomeUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
  }

  export type EpicUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput> | EpicCreateWithoutOrganizationInput[] | EpicUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOrganizationInput | EpicCreateOrConnectWithoutOrganizationInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutOrganizationInput | EpicUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EpicCreateManyOrganizationInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutOrganizationInput | EpicUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutOrganizationInput | EpicUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type StoryUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput> | StoryCreateWithoutOrganizationInput[] | StoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOrganizationInput | StoryCreateOrConnectWithoutOrganizationInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutOrganizationInput | StoryUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: StoryCreateManyOrganizationInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutOrganizationInput | StoryUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutOrganizationInput | StoryUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type TollgateUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput> | TollgateCreateWithoutOrganizationInput[] | TollgateUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutOrganizationInput | TollgateCreateOrConnectWithoutOrganizationInput[]
    upsert?: TollgateUpsertWithWhereUniqueWithoutOrganizationInput | TollgateUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: TollgateCreateManyOrganizationInputEnvelope
    set?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    disconnect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    delete?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    update?: TollgateUpdateWithWhereUniqueWithoutOrganizationInput | TollgateUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: TollgateUpdateManyWithWhereWithoutOrganizationInput | TollgateUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
  }

  export type ActivityEventUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput> | ActivityEventCreateWithoutOrganizationInput[] | ActivityEventUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutOrganizationInput | ActivityEventCreateOrConnectWithoutOrganizationInput[]
    upsert?: ActivityEventUpsertWithWhereUniqueWithoutOrganizationInput | ActivityEventUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ActivityEventCreateManyOrganizationInputEnvelope
    set?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    disconnect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    delete?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    update?: ActivityEventUpdateWithWhereUniqueWithoutOrganizationInput | ActivityEventUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ActivityEventUpdateManyWithWhereWithoutOrganizationInput | ActivityEventUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
  }

  export type MembershipUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput> | MembershipCreateWithoutOrganizationInput[] | MembershipUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutOrganizationInput | MembershipCreateOrConnectWithoutOrganizationInput[]
    upsert?: MembershipUpsertWithWhereUniqueWithoutOrganizationInput | MembershipUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: MembershipCreateManyOrganizationInputEnvelope
    set?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    disconnect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    delete?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    update?: MembershipUpdateWithWhereUniqueWithoutOrganizationInput | MembershipUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: MembershipUpdateManyWithWhereWithoutOrganizationInput | MembershipUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
  }

  export type OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput> | OutcomeCreateWithoutOrganizationInput[] | OutcomeUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutOrganizationInput | OutcomeCreateOrConnectWithoutOrganizationInput[]
    upsert?: OutcomeUpsertWithWhereUniqueWithoutOrganizationInput | OutcomeUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: OutcomeCreateManyOrganizationInputEnvelope
    set?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    disconnect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    delete?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    update?: OutcomeUpdateWithWhereUniqueWithoutOrganizationInput | OutcomeUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: OutcomeUpdateManyWithWhereWithoutOrganizationInput | OutcomeUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
  }

  export type EpicUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput> | EpicCreateWithoutOrganizationInput[] | EpicUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOrganizationInput | EpicCreateOrConnectWithoutOrganizationInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutOrganizationInput | EpicUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: EpicCreateManyOrganizationInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutOrganizationInput | EpicUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutOrganizationInput | EpicUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type StoryUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput> | StoryCreateWithoutOrganizationInput[] | StoryUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOrganizationInput | StoryCreateOrConnectWithoutOrganizationInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutOrganizationInput | StoryUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: StoryCreateManyOrganizationInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutOrganizationInput | StoryUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutOrganizationInput | StoryUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type TollgateUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput> | TollgateCreateWithoutOrganizationInput[] | TollgateUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutOrganizationInput | TollgateCreateOrConnectWithoutOrganizationInput[]
    upsert?: TollgateUpsertWithWhereUniqueWithoutOrganizationInput | TollgateUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: TollgateCreateManyOrganizationInputEnvelope
    set?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    disconnect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    delete?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    update?: TollgateUpdateWithWhereUniqueWithoutOrganizationInput | TollgateUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: TollgateUpdateManyWithWhereWithoutOrganizationInput | TollgateUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
  }

  export type ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput> | ActivityEventCreateWithoutOrganizationInput[] | ActivityEventUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutOrganizationInput | ActivityEventCreateOrConnectWithoutOrganizationInput[]
    upsert?: ActivityEventUpsertWithWhereUniqueWithoutOrganizationInput | ActivityEventUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ActivityEventCreateManyOrganizationInputEnvelope
    set?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    disconnect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    delete?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    update?: ActivityEventUpdateWithWhereUniqueWithoutOrganizationInput | ActivityEventUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ActivityEventUpdateManyWithWhereWithoutOrganizationInput | ActivityEventUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
  }

  export type MembershipCreateNestedManyWithoutUserInput = {
    create?: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput> | MembershipCreateWithoutUserInput[] | MembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutUserInput | MembershipCreateOrConnectWithoutUserInput[]
    createMany?: MembershipCreateManyUserInputEnvelope
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
  }

  export type OutcomeCreateNestedManyWithoutValueOwnerInput = {
    create?: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput> | OutcomeCreateWithoutValueOwnerInput[] | OutcomeUncheckedCreateWithoutValueOwnerInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutValueOwnerInput | OutcomeCreateOrConnectWithoutValueOwnerInput[]
    createMany?: OutcomeCreateManyValueOwnerInputEnvelope
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
  }

  export type TollgateCreateNestedManyWithoutDecisionActorInput = {
    create?: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput> | TollgateCreateWithoutDecisionActorInput[] | TollgateUncheckedCreateWithoutDecisionActorInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutDecisionActorInput | TollgateCreateOrConnectWithoutDecisionActorInput[]
    createMany?: TollgateCreateManyDecisionActorInputEnvelope
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
  }

  export type ActivityEventCreateNestedManyWithoutActorInput = {
    create?: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput> | ActivityEventCreateWithoutActorInput[] | ActivityEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutActorInput | ActivityEventCreateOrConnectWithoutActorInput[]
    createMany?: ActivityEventCreateManyActorInputEnvelope
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
  }

  export type MembershipUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput> | MembershipCreateWithoutUserInput[] | MembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutUserInput | MembershipCreateOrConnectWithoutUserInput[]
    createMany?: MembershipCreateManyUserInputEnvelope
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
  }

  export type OutcomeUncheckedCreateNestedManyWithoutValueOwnerInput = {
    create?: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput> | OutcomeCreateWithoutValueOwnerInput[] | OutcomeUncheckedCreateWithoutValueOwnerInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutValueOwnerInput | OutcomeCreateOrConnectWithoutValueOwnerInput[]
    createMany?: OutcomeCreateManyValueOwnerInputEnvelope
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
  }

  export type TollgateUncheckedCreateNestedManyWithoutDecisionActorInput = {
    create?: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput> | TollgateCreateWithoutDecisionActorInput[] | TollgateUncheckedCreateWithoutDecisionActorInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutDecisionActorInput | TollgateCreateOrConnectWithoutDecisionActorInput[]
    createMany?: TollgateCreateManyDecisionActorInputEnvelope
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
  }

  export type ActivityEventUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput> | ActivityEventCreateWithoutActorInput[] | ActivityEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutActorInput | ActivityEventCreateOrConnectWithoutActorInput[]
    createMany?: ActivityEventCreateManyActorInputEnvelope
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type MembershipUpdateManyWithoutUserNestedInput = {
    create?: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput> | MembershipCreateWithoutUserInput[] | MembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutUserInput | MembershipCreateOrConnectWithoutUserInput[]
    upsert?: MembershipUpsertWithWhereUniqueWithoutUserInput | MembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MembershipCreateManyUserInputEnvelope
    set?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    disconnect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    delete?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    update?: MembershipUpdateWithWhereUniqueWithoutUserInput | MembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MembershipUpdateManyWithWhereWithoutUserInput | MembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
  }

  export type OutcomeUpdateManyWithoutValueOwnerNestedInput = {
    create?: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput> | OutcomeCreateWithoutValueOwnerInput[] | OutcomeUncheckedCreateWithoutValueOwnerInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutValueOwnerInput | OutcomeCreateOrConnectWithoutValueOwnerInput[]
    upsert?: OutcomeUpsertWithWhereUniqueWithoutValueOwnerInput | OutcomeUpsertWithWhereUniqueWithoutValueOwnerInput[]
    createMany?: OutcomeCreateManyValueOwnerInputEnvelope
    set?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    disconnect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    delete?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    update?: OutcomeUpdateWithWhereUniqueWithoutValueOwnerInput | OutcomeUpdateWithWhereUniqueWithoutValueOwnerInput[]
    updateMany?: OutcomeUpdateManyWithWhereWithoutValueOwnerInput | OutcomeUpdateManyWithWhereWithoutValueOwnerInput[]
    deleteMany?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
  }

  export type TollgateUpdateManyWithoutDecisionActorNestedInput = {
    create?: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput> | TollgateCreateWithoutDecisionActorInput[] | TollgateUncheckedCreateWithoutDecisionActorInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutDecisionActorInput | TollgateCreateOrConnectWithoutDecisionActorInput[]
    upsert?: TollgateUpsertWithWhereUniqueWithoutDecisionActorInput | TollgateUpsertWithWhereUniqueWithoutDecisionActorInput[]
    createMany?: TollgateCreateManyDecisionActorInputEnvelope
    set?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    disconnect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    delete?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    update?: TollgateUpdateWithWhereUniqueWithoutDecisionActorInput | TollgateUpdateWithWhereUniqueWithoutDecisionActorInput[]
    updateMany?: TollgateUpdateManyWithWhereWithoutDecisionActorInput | TollgateUpdateManyWithWhereWithoutDecisionActorInput[]
    deleteMany?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
  }

  export type ActivityEventUpdateManyWithoutActorNestedInput = {
    create?: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput> | ActivityEventCreateWithoutActorInput[] | ActivityEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutActorInput | ActivityEventCreateOrConnectWithoutActorInput[]
    upsert?: ActivityEventUpsertWithWhereUniqueWithoutActorInput | ActivityEventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: ActivityEventCreateManyActorInputEnvelope
    set?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    disconnect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    delete?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    update?: ActivityEventUpdateWithWhereUniqueWithoutActorInput | ActivityEventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: ActivityEventUpdateManyWithWhereWithoutActorInput | ActivityEventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
  }

  export type MembershipUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput> | MembershipCreateWithoutUserInput[] | MembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipCreateOrConnectWithoutUserInput | MembershipCreateOrConnectWithoutUserInput[]
    upsert?: MembershipUpsertWithWhereUniqueWithoutUserInput | MembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MembershipCreateManyUserInputEnvelope
    set?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    disconnect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    delete?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    connect?: MembershipWhereUniqueInput | MembershipWhereUniqueInput[]
    update?: MembershipUpdateWithWhereUniqueWithoutUserInput | MembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MembershipUpdateManyWithWhereWithoutUserInput | MembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
  }

  export type OutcomeUncheckedUpdateManyWithoutValueOwnerNestedInput = {
    create?: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput> | OutcomeCreateWithoutValueOwnerInput[] | OutcomeUncheckedCreateWithoutValueOwnerInput[]
    connectOrCreate?: OutcomeCreateOrConnectWithoutValueOwnerInput | OutcomeCreateOrConnectWithoutValueOwnerInput[]
    upsert?: OutcomeUpsertWithWhereUniqueWithoutValueOwnerInput | OutcomeUpsertWithWhereUniqueWithoutValueOwnerInput[]
    createMany?: OutcomeCreateManyValueOwnerInputEnvelope
    set?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    disconnect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    delete?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    connect?: OutcomeWhereUniqueInput | OutcomeWhereUniqueInput[]
    update?: OutcomeUpdateWithWhereUniqueWithoutValueOwnerInput | OutcomeUpdateWithWhereUniqueWithoutValueOwnerInput[]
    updateMany?: OutcomeUpdateManyWithWhereWithoutValueOwnerInput | OutcomeUpdateManyWithWhereWithoutValueOwnerInput[]
    deleteMany?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
  }

  export type TollgateUncheckedUpdateManyWithoutDecisionActorNestedInput = {
    create?: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput> | TollgateCreateWithoutDecisionActorInput[] | TollgateUncheckedCreateWithoutDecisionActorInput[]
    connectOrCreate?: TollgateCreateOrConnectWithoutDecisionActorInput | TollgateCreateOrConnectWithoutDecisionActorInput[]
    upsert?: TollgateUpsertWithWhereUniqueWithoutDecisionActorInput | TollgateUpsertWithWhereUniqueWithoutDecisionActorInput[]
    createMany?: TollgateCreateManyDecisionActorInputEnvelope
    set?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    disconnect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    delete?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    connect?: TollgateWhereUniqueInput | TollgateWhereUniqueInput[]
    update?: TollgateUpdateWithWhereUniqueWithoutDecisionActorInput | TollgateUpdateWithWhereUniqueWithoutDecisionActorInput[]
    updateMany?: TollgateUpdateManyWithWhereWithoutDecisionActorInput | TollgateUpdateManyWithWhereWithoutDecisionActorInput[]
    deleteMany?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
  }

  export type ActivityEventUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput> | ActivityEventCreateWithoutActorInput[] | ActivityEventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: ActivityEventCreateOrConnectWithoutActorInput | ActivityEventCreateOrConnectWithoutActorInput[]
    upsert?: ActivityEventUpsertWithWhereUniqueWithoutActorInput | ActivityEventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: ActivityEventCreateManyActorInputEnvelope
    set?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    disconnect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    delete?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    connect?: ActivityEventWhereUniqueInput | ActivityEventWhereUniqueInput[]
    update?: ActivityEventUpdateWithWhereUniqueWithoutActorInput | ActivityEventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: ActivityEventUpdateManyWithWhereWithoutActorInput | ActivityEventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<OrganizationCreateWithoutMembershipsInput, OrganizationUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutMembershipsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AppUserCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<AppUserCreateWithoutMembershipsInput, AppUserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutMembershipsInput
    connect?: AppUserWhereUniqueInput
  }

  export type EnumMembershipRoleFieldUpdateOperationsInput = {
    set?: $Enums.MembershipRole
  }

  export type OrganizationUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<OrganizationCreateWithoutMembershipsInput, OrganizationUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutMembershipsInput
    upsert?: OrganizationUpsertWithoutMembershipsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutMembershipsInput, OrganizationUpdateWithoutMembershipsInput>, OrganizationUncheckedUpdateWithoutMembershipsInput>
  }

  export type AppUserUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<AppUserCreateWithoutMembershipsInput, AppUserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutMembershipsInput
    upsert?: AppUserUpsertWithoutMembershipsInput
    connect?: AppUserWhereUniqueInput
    update?: XOR<XOR<AppUserUpdateToOneWithWhereWithoutMembershipsInput, AppUserUpdateWithoutMembershipsInput>, AppUserUncheckedUpdateWithoutMembershipsInput>
  }

  export type OrganizationCreateNestedOneWithoutOutcomesInput = {
    create?: XOR<OrganizationCreateWithoutOutcomesInput, OrganizationUncheckedCreateWithoutOutcomesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutOutcomesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AppUserCreateNestedOneWithoutOwnedOutcomesInput = {
    create?: XOR<AppUserCreateWithoutOwnedOutcomesInput, AppUserUncheckedCreateWithoutOwnedOutcomesInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutOwnedOutcomesInput
    connect?: AppUserWhereUniqueInput
  }

  export type EpicCreateNestedManyWithoutOutcomeInput = {
    create?: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput> | EpicCreateWithoutOutcomeInput[] | EpicUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOutcomeInput | EpicCreateOrConnectWithoutOutcomeInput[]
    createMany?: EpicCreateManyOutcomeInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type StoryCreateNestedManyWithoutOutcomeInput = {
    create?: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput> | StoryCreateWithoutOutcomeInput[] | StoryUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOutcomeInput | StoryCreateOrConnectWithoutOutcomeInput[]
    createMany?: StoryCreateManyOutcomeInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type EpicUncheckedCreateNestedManyWithoutOutcomeInput = {
    create?: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput> | EpicCreateWithoutOutcomeInput[] | EpicUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOutcomeInput | EpicCreateOrConnectWithoutOutcomeInput[]
    createMany?: EpicCreateManyOutcomeInputEnvelope
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
  }

  export type StoryUncheckedCreateNestedManyWithoutOutcomeInput = {
    create?: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput> | StoryCreateWithoutOutcomeInput[] | StoryUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOutcomeInput | StoryCreateOrConnectWithoutOutcomeInput[]
    createMany?: StoryCreateManyOutcomeInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type EnumRiskProfileFieldUpdateOperationsInput = {
    set?: $Enums.RiskProfile
  }

  export type EnumAiAccelerationLevelFieldUpdateOperationsInput = {
    set?: $Enums.AiAccelerationLevel
  }

  export type EnumOutcomeStatusFieldUpdateOperationsInput = {
    set?: $Enums.OutcomeStatus
  }

  export type OrganizationUpdateOneRequiredWithoutOutcomesNestedInput = {
    create?: XOR<OrganizationCreateWithoutOutcomesInput, OrganizationUncheckedCreateWithoutOutcomesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutOutcomesInput
    upsert?: OrganizationUpsertWithoutOutcomesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutOutcomesInput, OrganizationUpdateWithoutOutcomesInput>, OrganizationUncheckedUpdateWithoutOutcomesInput>
  }

  export type AppUserUpdateOneWithoutOwnedOutcomesNestedInput = {
    create?: XOR<AppUserCreateWithoutOwnedOutcomesInput, AppUserUncheckedCreateWithoutOwnedOutcomesInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutOwnedOutcomesInput
    upsert?: AppUserUpsertWithoutOwnedOutcomesInput
    disconnect?: AppUserWhereInput | boolean
    delete?: AppUserWhereInput | boolean
    connect?: AppUserWhereUniqueInput
    update?: XOR<XOR<AppUserUpdateToOneWithWhereWithoutOwnedOutcomesInput, AppUserUpdateWithoutOwnedOutcomesInput>, AppUserUncheckedUpdateWithoutOwnedOutcomesInput>
  }

  export type EpicUpdateManyWithoutOutcomeNestedInput = {
    create?: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput> | EpicCreateWithoutOutcomeInput[] | EpicUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOutcomeInput | EpicCreateOrConnectWithoutOutcomeInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutOutcomeInput | EpicUpsertWithWhereUniqueWithoutOutcomeInput[]
    createMany?: EpicCreateManyOutcomeInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutOutcomeInput | EpicUpdateWithWhereUniqueWithoutOutcomeInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutOutcomeInput | EpicUpdateManyWithWhereWithoutOutcomeInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type StoryUpdateManyWithoutOutcomeNestedInput = {
    create?: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput> | StoryCreateWithoutOutcomeInput[] | StoryUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOutcomeInput | StoryCreateOrConnectWithoutOutcomeInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutOutcomeInput | StoryUpsertWithWhereUniqueWithoutOutcomeInput[]
    createMany?: StoryCreateManyOutcomeInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutOutcomeInput | StoryUpdateWithWhereUniqueWithoutOutcomeInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutOutcomeInput | StoryUpdateManyWithWhereWithoutOutcomeInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type EpicUncheckedUpdateManyWithoutOutcomeNestedInput = {
    create?: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput> | EpicCreateWithoutOutcomeInput[] | EpicUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: EpicCreateOrConnectWithoutOutcomeInput | EpicCreateOrConnectWithoutOutcomeInput[]
    upsert?: EpicUpsertWithWhereUniqueWithoutOutcomeInput | EpicUpsertWithWhereUniqueWithoutOutcomeInput[]
    createMany?: EpicCreateManyOutcomeInputEnvelope
    set?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    disconnect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    delete?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    connect?: EpicWhereUniqueInput | EpicWhereUniqueInput[]
    update?: EpicUpdateWithWhereUniqueWithoutOutcomeInput | EpicUpdateWithWhereUniqueWithoutOutcomeInput[]
    updateMany?: EpicUpdateManyWithWhereWithoutOutcomeInput | EpicUpdateManyWithWhereWithoutOutcomeInput[]
    deleteMany?: EpicScalarWhereInput | EpicScalarWhereInput[]
  }

  export type StoryUncheckedUpdateManyWithoutOutcomeNestedInput = {
    create?: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput> | StoryCreateWithoutOutcomeInput[] | StoryUncheckedCreateWithoutOutcomeInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutOutcomeInput | StoryCreateOrConnectWithoutOutcomeInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutOutcomeInput | StoryUpsertWithWhereUniqueWithoutOutcomeInput[]
    createMany?: StoryCreateManyOutcomeInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutOutcomeInput | StoryUpdateWithWhereUniqueWithoutOutcomeInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutOutcomeInput | StoryUpdateManyWithWhereWithoutOutcomeInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type OrganizationCreateNestedOneWithoutEpicsInput = {
    create?: XOR<OrganizationCreateWithoutEpicsInput, OrganizationUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEpicsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OutcomeCreateNestedOneWithoutEpicsInput = {
    create?: XOR<OutcomeCreateWithoutEpicsInput, OutcomeUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: OutcomeCreateOrConnectWithoutEpicsInput
    connect?: OutcomeWhereUniqueInput
  }

  export type StoryCreateNestedManyWithoutEpicInput = {
    create?: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput> | StoryCreateWithoutEpicInput[] | StoryUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutEpicInput | StoryCreateOrConnectWithoutEpicInput[]
    createMany?: StoryCreateManyEpicInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type StoryUncheckedCreateNestedManyWithoutEpicInput = {
    create?: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput> | StoryCreateWithoutEpicInput[] | StoryUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutEpicInput | StoryCreateOrConnectWithoutEpicInput[]
    createMany?: StoryCreateManyEpicInputEnvelope
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
  }

  export type EnumEpicStatusFieldUpdateOperationsInput = {
    set?: $Enums.EpicStatus
  }

  export type OrganizationUpdateOneRequiredWithoutEpicsNestedInput = {
    create?: XOR<OrganizationCreateWithoutEpicsInput, OrganizationUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEpicsInput
    upsert?: OrganizationUpsertWithoutEpicsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutEpicsInput, OrganizationUpdateWithoutEpicsInput>, OrganizationUncheckedUpdateWithoutEpicsInput>
  }

  export type OutcomeUpdateOneRequiredWithoutEpicsNestedInput = {
    create?: XOR<OutcomeCreateWithoutEpicsInput, OutcomeUncheckedCreateWithoutEpicsInput>
    connectOrCreate?: OutcomeCreateOrConnectWithoutEpicsInput
    upsert?: OutcomeUpsertWithoutEpicsInput
    connect?: OutcomeWhereUniqueInput
    update?: XOR<XOR<OutcomeUpdateToOneWithWhereWithoutEpicsInput, OutcomeUpdateWithoutEpicsInput>, OutcomeUncheckedUpdateWithoutEpicsInput>
  }

  export type StoryUpdateManyWithoutEpicNestedInput = {
    create?: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput> | StoryCreateWithoutEpicInput[] | StoryUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutEpicInput | StoryCreateOrConnectWithoutEpicInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutEpicInput | StoryUpsertWithWhereUniqueWithoutEpicInput[]
    createMany?: StoryCreateManyEpicInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutEpicInput | StoryUpdateWithWhereUniqueWithoutEpicInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutEpicInput | StoryUpdateManyWithWhereWithoutEpicInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type StoryUncheckedUpdateManyWithoutEpicNestedInput = {
    create?: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput> | StoryCreateWithoutEpicInput[] | StoryUncheckedCreateWithoutEpicInput[]
    connectOrCreate?: StoryCreateOrConnectWithoutEpicInput | StoryCreateOrConnectWithoutEpicInput[]
    upsert?: StoryUpsertWithWhereUniqueWithoutEpicInput | StoryUpsertWithWhereUniqueWithoutEpicInput[]
    createMany?: StoryCreateManyEpicInputEnvelope
    set?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    disconnect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    delete?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    connect?: StoryWhereUniqueInput | StoryWhereUniqueInput[]
    update?: StoryUpdateWithWhereUniqueWithoutEpicInput | StoryUpdateWithWhereUniqueWithoutEpicInput[]
    updateMany?: StoryUpdateManyWithWhereWithoutEpicInput | StoryUpdateManyWithWhereWithoutEpicInput[]
    deleteMany?: StoryScalarWhereInput | StoryScalarWhereInput[]
  }

  export type StoryCreateacceptanceCriteriaInput = {
    set: string[]
  }

  export type StoryCreateaiUsageScopeInput = {
    set: string[]
  }

  export type StoryCreatedefinitionOfDoneInput = {
    set: string[]
  }

  export type OrganizationCreateNestedOneWithoutStoriesInput = {
    create?: XOR<OrganizationCreateWithoutStoriesInput, OrganizationUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutStoriesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type OutcomeCreateNestedOneWithoutStoriesInput = {
    create?: XOR<OutcomeCreateWithoutStoriesInput, OutcomeUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: OutcomeCreateOrConnectWithoutStoriesInput
    connect?: OutcomeWhereUniqueInput
  }

  export type EpicCreateNestedOneWithoutStoriesInput = {
    create?: XOR<EpicCreateWithoutStoriesInput, EpicUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: EpicCreateOrConnectWithoutStoriesInput
    connect?: EpicWhereUniqueInput
  }

  export type EnumStoryTypeFieldUpdateOperationsInput = {
    set?: $Enums.StoryType
  }

  export type StoryUpdateacceptanceCriteriaInput = {
    set?: string[]
    push?: string | string[]
  }

  export type StoryUpdateaiUsageScopeInput = {
    set?: string[]
    push?: string | string[]
  }

  export type StoryUpdatedefinitionOfDoneInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumStoryStatusFieldUpdateOperationsInput = {
    set?: $Enums.StoryStatus
  }

  export type OrganizationUpdateOneRequiredWithoutStoriesNestedInput = {
    create?: XOR<OrganizationCreateWithoutStoriesInput, OrganizationUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutStoriesInput
    upsert?: OrganizationUpsertWithoutStoriesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutStoriesInput, OrganizationUpdateWithoutStoriesInput>, OrganizationUncheckedUpdateWithoutStoriesInput>
  }

  export type OutcomeUpdateOneRequiredWithoutStoriesNestedInput = {
    create?: XOR<OutcomeCreateWithoutStoriesInput, OutcomeUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: OutcomeCreateOrConnectWithoutStoriesInput
    upsert?: OutcomeUpsertWithoutStoriesInput
    connect?: OutcomeWhereUniqueInput
    update?: XOR<XOR<OutcomeUpdateToOneWithWhereWithoutStoriesInput, OutcomeUpdateWithoutStoriesInput>, OutcomeUncheckedUpdateWithoutStoriesInput>
  }

  export type EpicUpdateOneRequiredWithoutStoriesNestedInput = {
    create?: XOR<EpicCreateWithoutStoriesInput, EpicUncheckedCreateWithoutStoriesInput>
    connectOrCreate?: EpicCreateOrConnectWithoutStoriesInput
    upsert?: EpicUpsertWithoutStoriesInput
    connect?: EpicWhereUniqueInput
    update?: XOR<XOR<EpicUpdateToOneWithWhereWithoutStoriesInput, EpicUpdateWithoutStoriesInput>, EpicUncheckedUpdateWithoutStoriesInput>
  }

  export type TollgateCreateblockersInput = {
    set: string[]
  }

  export type TollgateCreateapproverRolesInput = {
    set: $Enums.MembershipRole[]
  }

  export type OrganizationCreateNestedOneWithoutTollgatesInput = {
    create?: XOR<OrganizationCreateWithoutTollgatesInput, OrganizationUncheckedCreateWithoutTollgatesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutTollgatesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AppUserCreateNestedOneWithoutTollgateDecisionsInput = {
    create?: XOR<AppUserCreateWithoutTollgateDecisionsInput, AppUserUncheckedCreateWithoutTollgateDecisionsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutTollgateDecisionsInput
    connect?: AppUserWhereUniqueInput
  }

  export type EnumTollgateEntityTypeFieldUpdateOperationsInput = {
    set?: $Enums.TollgateEntityType
  }

  export type EnumTollgateTypeFieldUpdateOperationsInput = {
    set?: $Enums.TollgateType
  }

  export type EnumTollgateStatusFieldUpdateOperationsInput = {
    set?: $Enums.TollgateStatus
  }

  export type TollgateUpdateblockersInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TollgateUpdateapproverRolesInput = {
    set?: $Enums.MembershipRole[]
    push?: $Enums.MembershipRole | $Enums.MembershipRole[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type OrganizationUpdateOneRequiredWithoutTollgatesNestedInput = {
    create?: XOR<OrganizationCreateWithoutTollgatesInput, OrganizationUncheckedCreateWithoutTollgatesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutTollgatesInput
    upsert?: OrganizationUpsertWithoutTollgatesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutTollgatesInput, OrganizationUpdateWithoutTollgatesInput>, OrganizationUncheckedUpdateWithoutTollgatesInput>
  }

  export type AppUserUpdateOneWithoutTollgateDecisionsNestedInput = {
    create?: XOR<AppUserCreateWithoutTollgateDecisionsInput, AppUserUncheckedCreateWithoutTollgateDecisionsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutTollgateDecisionsInput
    upsert?: AppUserUpsertWithoutTollgateDecisionsInput
    disconnect?: AppUserWhereInput | boolean
    delete?: AppUserWhereInput | boolean
    connect?: AppUserWhereUniqueInput
    update?: XOR<XOR<AppUserUpdateToOneWithWhereWithoutTollgateDecisionsInput, AppUserUpdateWithoutTollgateDecisionsInput>, AppUserUncheckedUpdateWithoutTollgateDecisionsInput>
  }

  export type OrganizationCreateNestedOneWithoutActivityEventsInput = {
    create?: XOR<OrganizationCreateWithoutActivityEventsInput, OrganizationUncheckedCreateWithoutActivityEventsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutActivityEventsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AppUserCreateNestedOneWithoutActivityEventsInput = {
    create?: XOR<AppUserCreateWithoutActivityEventsInput, AppUserUncheckedCreateWithoutActivityEventsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutActivityEventsInput
    connect?: AppUserWhereUniqueInput
  }

  export type EnumActivityEntityTypeFieldUpdateOperationsInput = {
    set?: $Enums.ActivityEntityType
  }

  export type EnumActivityEventTypeFieldUpdateOperationsInput = {
    set?: $Enums.ActivityEventType
  }

  export type OrganizationUpdateOneRequiredWithoutActivityEventsNestedInput = {
    create?: XOR<OrganizationCreateWithoutActivityEventsInput, OrganizationUncheckedCreateWithoutActivityEventsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutActivityEventsInput
    upsert?: OrganizationUpsertWithoutActivityEventsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutActivityEventsInput, OrganizationUpdateWithoutActivityEventsInput>, OrganizationUncheckedUpdateWithoutActivityEventsInput>
  }

  export type AppUserUpdateOneWithoutActivityEventsNestedInput = {
    create?: XOR<AppUserCreateWithoutActivityEventsInput, AppUserUncheckedCreateWithoutActivityEventsInput>
    connectOrCreate?: AppUserCreateOrConnectWithoutActivityEventsInput
    upsert?: AppUserUpsertWithoutActivityEventsInput
    disconnect?: AppUserWhereInput | boolean
    delete?: AppUserWhereInput | boolean
    connect?: AppUserWhereUniqueInput
    update?: XOR<XOR<AppUserUpdateToOneWithWhereWithoutActivityEventsInput, AppUserUpdateWithoutActivityEventsInput>, AppUserUncheckedUpdateWithoutActivityEventsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleFilter<$PrismaModel> | $Enums.MembershipRole
  }

  export type NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MembershipRole | EnumMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MembershipRole[] | ListEnumMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.MembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumMembershipRoleFilter<$PrismaModel>
  }

  export type NestedEnumRiskProfileFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileFilter<$PrismaModel> | $Enums.RiskProfile
  }

  export type NestedEnumAiAccelerationLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.AiAccelerationLevel | EnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAiAccelerationLevelFilter<$PrismaModel> | $Enums.AiAccelerationLevel
  }

  export type NestedEnumOutcomeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusFilter<$PrismaModel> | $Enums.OutcomeStatus
  }

  export type NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RiskProfile | EnumRiskProfileFieldRefInput<$PrismaModel>
    in?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    notIn?: $Enums.RiskProfile[] | ListEnumRiskProfileFieldRefInput<$PrismaModel>
    not?: NestedEnumRiskProfileWithAggregatesFilter<$PrismaModel> | $Enums.RiskProfile
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRiskProfileFilter<$PrismaModel>
    _max?: NestedEnumRiskProfileFilter<$PrismaModel>
  }

  export type NestedEnumAiAccelerationLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AiAccelerationLevel | EnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiAccelerationLevel[] | ListEnumAiAccelerationLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAiAccelerationLevelWithAggregatesFilter<$PrismaModel> | $Enums.AiAccelerationLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAiAccelerationLevelFilter<$PrismaModel>
    _max?: NestedEnumAiAccelerationLevelFilter<$PrismaModel>
  }

  export type NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OutcomeStatus | EnumOutcomeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OutcomeStatus[] | ListEnumOutcomeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOutcomeStatusWithAggregatesFilter<$PrismaModel> | $Enums.OutcomeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOutcomeStatusFilter<$PrismaModel>
    _max?: NestedEnumOutcomeStatusFilter<$PrismaModel>
  }

  export type NestedEnumEpicStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EpicStatus | EnumEpicStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEpicStatusFilter<$PrismaModel> | $Enums.EpicStatus
  }

  export type NestedEnumEpicStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EpicStatus | EnumEpicStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EpicStatus[] | ListEnumEpicStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEpicStatusWithAggregatesFilter<$PrismaModel> | $Enums.EpicStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEpicStatusFilter<$PrismaModel>
    _max?: NestedEnumEpicStatusFilter<$PrismaModel>
  }

  export type NestedEnumStoryTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryType | EnumStoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryTypeFilter<$PrismaModel> | $Enums.StoryType
  }

  export type NestedEnumStoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryStatus | EnumStoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryStatusFilter<$PrismaModel> | $Enums.StoryStatus
  }

  export type NestedEnumStoryTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryType | EnumStoryTypeFieldRefInput<$PrismaModel>
    in?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryType[] | ListEnumStoryTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryTypeWithAggregatesFilter<$PrismaModel> | $Enums.StoryType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoryTypeFilter<$PrismaModel>
    _max?: NestedEnumStoryTypeFilter<$PrismaModel>
  }

  export type NestedEnumStoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StoryStatus | EnumStoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.StoryStatus[] | ListEnumStoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.StoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStoryStatusFilter<$PrismaModel>
    _max?: NestedEnumStoryStatusFilter<$PrismaModel>
  }

  export type NestedEnumTollgateEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateEntityType | EnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateEntityTypeFilter<$PrismaModel> | $Enums.TollgateEntityType
  }

  export type NestedEnumTollgateTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateType | EnumTollgateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateTypeFilter<$PrismaModel> | $Enums.TollgateType
  }

  export type NestedEnumTollgateStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateStatus | EnumTollgateStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateStatusFilter<$PrismaModel> | $Enums.TollgateStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumTollgateEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateEntityType | EnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateEntityType[] | ListEnumTollgateEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.TollgateEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumTollgateEntityTypeFilter<$PrismaModel>
  }

  export type NestedEnumTollgateTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateType | EnumTollgateTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateType[] | ListEnumTollgateTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateTypeWithAggregatesFilter<$PrismaModel> | $Enums.TollgateType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateTypeFilter<$PrismaModel>
    _max?: NestedEnumTollgateTypeFilter<$PrismaModel>
  }

  export type NestedEnumTollgateStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TollgateStatus | EnumTollgateStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TollgateStatus[] | ListEnumTollgateStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTollgateStatusWithAggregatesFilter<$PrismaModel> | $Enums.TollgateStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTollgateStatusFilter<$PrismaModel>
    _max?: NestedEnumTollgateStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumActivityEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEntityType | EnumActivityEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEntityTypeFilter<$PrismaModel> | $Enums.ActivityEntityType
  }

  export type NestedEnumActivityEventTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEventType | EnumActivityEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEventTypeFilter<$PrismaModel> | $Enums.ActivityEventType
  }

  export type NestedEnumActivityEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEntityType | EnumActivityEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEntityType[] | ListEnumActivityEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumActivityEntityTypeFilter<$PrismaModel>
  }

  export type NestedEnumActivityEventTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ActivityEventType | EnumActivityEventTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ActivityEventType[] | ListEnumActivityEventTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumActivityEventTypeWithAggregatesFilter<$PrismaModel> | $Enums.ActivityEventType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumActivityEventTypeFilter<$PrismaModel>
    _max?: NestedEnumActivityEventTypeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type MembershipCreateWithoutOrganizationInput = {
    id: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    user: AppUserCreateNestedOneWithoutMembershipsInput
  }

  export type MembershipUncheckedCreateWithoutOrganizationInput = {
    id: string
    userId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MembershipCreateOrConnectWithoutOrganizationInput = {
    where: MembershipWhereUniqueInput
    create: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput>
  }

  export type MembershipCreateManyOrganizationInputEnvelope = {
    data: MembershipCreateManyOrganizationInput | MembershipCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type OutcomeCreateWithoutOrganizationInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    valueOwner?: AppUserCreateNestedOneWithoutOwnedOutcomesInput
    epics?: EpicCreateNestedManyWithoutOutcomeInput
    stories?: StoryCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUncheckedCreateWithoutOrganizationInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    epics?: EpicUncheckedCreateNestedManyWithoutOutcomeInput
    stories?: StoryUncheckedCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeCreateOrConnectWithoutOrganizationInput = {
    where: OutcomeWhereUniqueInput
    create: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput>
  }

  export type OutcomeCreateManyOrganizationInputEnvelope = {
    data: OutcomeCreateManyOrganizationInput | OutcomeCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type EpicCreateWithoutOrganizationInput = {
    id: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    outcome: OutcomeCreateNestedOneWithoutEpicsInput
    stories?: StoryCreateNestedManyWithoutEpicInput
  }

  export type EpicUncheckedCreateWithoutOrganizationInput = {
    id: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stories?: StoryUncheckedCreateNestedManyWithoutEpicInput
  }

  export type EpicCreateOrConnectWithoutOrganizationInput = {
    where: EpicWhereUniqueInput
    create: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput>
  }

  export type EpicCreateManyOrganizationInputEnvelope = {
    data: EpicCreateManyOrganizationInput | EpicCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type StoryCreateWithoutOrganizationInput = {
    id: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    outcome: OutcomeCreateNestedOneWithoutStoriesInput
    epic: EpicCreateNestedOneWithoutStoriesInput
  }

  export type StoryUncheckedCreateWithoutOrganizationInput = {
    id: string
    outcomeId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryCreateOrConnectWithoutOrganizationInput = {
    where: StoryWhereUniqueInput
    create: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput>
  }

  export type StoryCreateManyOrganizationInputEnvelope = {
    data: StoryCreateManyOrganizationInput | StoryCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type TollgateCreateWithoutOrganizationInput = {
    id: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisionActor?: AppUserCreateNestedOneWithoutTollgateDecisionsInput
  }

  export type TollgateUncheckedCreateWithoutOrganizationInput = {
    id: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: string | null
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateCreateOrConnectWithoutOrganizationInput = {
    where: TollgateWhereUniqueInput
    create: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput>
  }

  export type TollgateCreateManyOrganizationInputEnvelope = {
    data: TollgateCreateManyOrganizationInput | TollgateCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type ActivityEventCreateWithoutOrganizationInput = {
    id: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    actor?: AppUserCreateNestedOneWithoutActivityEventsInput
  }

  export type ActivityEventUncheckedCreateWithoutOrganizationInput = {
    id: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    actorId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityEventCreateOrConnectWithoutOrganizationInput = {
    where: ActivityEventWhereUniqueInput
    create: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput>
  }

  export type ActivityEventCreateManyOrganizationInputEnvelope = {
    data: ActivityEventCreateManyOrganizationInput | ActivityEventCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type MembershipUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: MembershipWhereUniqueInput
    update: XOR<MembershipUpdateWithoutOrganizationInput, MembershipUncheckedUpdateWithoutOrganizationInput>
    create: XOR<MembershipCreateWithoutOrganizationInput, MembershipUncheckedCreateWithoutOrganizationInput>
  }

  export type MembershipUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: MembershipWhereUniqueInput
    data: XOR<MembershipUpdateWithoutOrganizationInput, MembershipUncheckedUpdateWithoutOrganizationInput>
  }

  export type MembershipUpdateManyWithWhereWithoutOrganizationInput = {
    where: MembershipScalarWhereInput
    data: XOR<MembershipUpdateManyMutationInput, MembershipUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type MembershipScalarWhereInput = {
    AND?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
    OR?: MembershipScalarWhereInput[]
    NOT?: MembershipScalarWhereInput | MembershipScalarWhereInput[]
    id?: StringFilter<"Membership"> | string
    organizationId?: StringFilter<"Membership"> | string
    userId?: StringFilter<"Membership"> | string
    role?: EnumMembershipRoleFilter<"Membership"> | $Enums.MembershipRole
    createdAt?: DateTimeFilter<"Membership"> | Date | string
    updatedAt?: DateTimeFilter<"Membership"> | Date | string
  }

  export type OutcomeUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: OutcomeWhereUniqueInput
    update: XOR<OutcomeUpdateWithoutOrganizationInput, OutcomeUncheckedUpdateWithoutOrganizationInput>
    create: XOR<OutcomeCreateWithoutOrganizationInput, OutcomeUncheckedCreateWithoutOrganizationInput>
  }

  export type OutcomeUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: OutcomeWhereUniqueInput
    data: XOR<OutcomeUpdateWithoutOrganizationInput, OutcomeUncheckedUpdateWithoutOrganizationInput>
  }

  export type OutcomeUpdateManyWithWhereWithoutOrganizationInput = {
    where: OutcomeScalarWhereInput
    data: XOR<OutcomeUpdateManyMutationInput, OutcomeUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type OutcomeScalarWhereInput = {
    AND?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
    OR?: OutcomeScalarWhereInput[]
    NOT?: OutcomeScalarWhereInput | OutcomeScalarWhereInput[]
    id?: StringFilter<"Outcome"> | string
    organizationId?: StringFilter<"Outcome"> | string
    key?: StringFilter<"Outcome"> | string
    title?: StringFilter<"Outcome"> | string
    problemStatement?: StringNullableFilter<"Outcome"> | string | null
    outcomeStatement?: StringNullableFilter<"Outcome"> | string | null
    baselineDefinition?: StringNullableFilter<"Outcome"> | string | null
    baselineSource?: StringNullableFilter<"Outcome"> | string | null
    timeframe?: StringNullableFilter<"Outcome"> | string | null
    valueOwnerId?: StringNullableFilter<"Outcome"> | string | null
    riskProfile?: EnumRiskProfileFilter<"Outcome"> | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Outcome"> | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFilter<"Outcome"> | $Enums.OutcomeStatus
    createdAt?: DateTimeFilter<"Outcome"> | Date | string
    updatedAt?: DateTimeFilter<"Outcome"> | Date | string
  }

  export type EpicUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: EpicWhereUniqueInput
    update: XOR<EpicUpdateWithoutOrganizationInput, EpicUncheckedUpdateWithoutOrganizationInput>
    create: XOR<EpicCreateWithoutOrganizationInput, EpicUncheckedCreateWithoutOrganizationInput>
  }

  export type EpicUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: EpicWhereUniqueInput
    data: XOR<EpicUpdateWithoutOrganizationInput, EpicUncheckedUpdateWithoutOrganizationInput>
  }

  export type EpicUpdateManyWithWhereWithoutOrganizationInput = {
    where: EpicScalarWhereInput
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type EpicScalarWhereInput = {
    AND?: EpicScalarWhereInput | EpicScalarWhereInput[]
    OR?: EpicScalarWhereInput[]
    NOT?: EpicScalarWhereInput | EpicScalarWhereInput[]
    id?: StringFilter<"Epic"> | string
    organizationId?: StringFilter<"Epic"> | string
    outcomeId?: StringFilter<"Epic"> | string
    key?: StringFilter<"Epic"> | string
    title?: StringFilter<"Epic"> | string
    purpose?: StringFilter<"Epic"> | string
    status?: EnumEpicStatusFilter<"Epic"> | $Enums.EpicStatus
    createdAt?: DateTimeFilter<"Epic"> | Date | string
    updatedAt?: DateTimeFilter<"Epic"> | Date | string
  }

  export type StoryUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: StoryWhereUniqueInput
    update: XOR<StoryUpdateWithoutOrganizationInput, StoryUncheckedUpdateWithoutOrganizationInput>
    create: XOR<StoryCreateWithoutOrganizationInput, StoryUncheckedCreateWithoutOrganizationInput>
  }

  export type StoryUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: StoryWhereUniqueInput
    data: XOR<StoryUpdateWithoutOrganizationInput, StoryUncheckedUpdateWithoutOrganizationInput>
  }

  export type StoryUpdateManyWithWhereWithoutOrganizationInput = {
    where: StoryScalarWhereInput
    data: XOR<StoryUpdateManyMutationInput, StoryUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type StoryScalarWhereInput = {
    AND?: StoryScalarWhereInput | StoryScalarWhereInput[]
    OR?: StoryScalarWhereInput[]
    NOT?: StoryScalarWhereInput | StoryScalarWhereInput[]
    id?: StringFilter<"Story"> | string
    organizationId?: StringFilter<"Story"> | string
    outcomeId?: StringFilter<"Story"> | string
    epicId?: StringFilter<"Story"> | string
    key?: StringFilter<"Story"> | string
    title?: StringFilter<"Story"> | string
    storyType?: EnumStoryTypeFilter<"Story"> | $Enums.StoryType
    valueIntent?: StringFilter<"Story"> | string
    acceptanceCriteria?: StringNullableListFilter<"Story">
    aiUsageScope?: StringNullableListFilter<"Story">
    aiAccelerationLevel?: EnumAiAccelerationLevelFilter<"Story"> | $Enums.AiAccelerationLevel
    testDefinition?: StringNullableFilter<"Story"> | string | null
    definitionOfDone?: StringNullableListFilter<"Story">
    status?: EnumStoryStatusFilter<"Story"> | $Enums.StoryStatus
    createdAt?: DateTimeFilter<"Story"> | Date | string
    updatedAt?: DateTimeFilter<"Story"> | Date | string
  }

  export type TollgateUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: TollgateWhereUniqueInput
    update: XOR<TollgateUpdateWithoutOrganizationInput, TollgateUncheckedUpdateWithoutOrganizationInput>
    create: XOR<TollgateCreateWithoutOrganizationInput, TollgateUncheckedCreateWithoutOrganizationInput>
  }

  export type TollgateUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: TollgateWhereUniqueInput
    data: XOR<TollgateUpdateWithoutOrganizationInput, TollgateUncheckedUpdateWithoutOrganizationInput>
  }

  export type TollgateUpdateManyWithWhereWithoutOrganizationInput = {
    where: TollgateScalarWhereInput
    data: XOR<TollgateUpdateManyMutationInput, TollgateUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type TollgateScalarWhereInput = {
    AND?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
    OR?: TollgateScalarWhereInput[]
    NOT?: TollgateScalarWhereInput | TollgateScalarWhereInput[]
    id?: StringFilter<"Tollgate"> | string
    organizationId?: StringFilter<"Tollgate"> | string
    entityType?: EnumTollgateEntityTypeFilter<"Tollgate"> | $Enums.TollgateEntityType
    entityId?: StringFilter<"Tollgate"> | string
    tollgateType?: EnumTollgateTypeFilter<"Tollgate"> | $Enums.TollgateType
    status?: EnumTollgateStatusFilter<"Tollgate"> | $Enums.TollgateStatus
    blockers?: StringNullableListFilter<"Tollgate">
    approverRoles?: EnumMembershipRoleNullableListFilter<"Tollgate">
    decidedBy?: StringNullableFilter<"Tollgate"> | string | null
    decidedAt?: DateTimeNullableFilter<"Tollgate"> | Date | string | null
    comments?: StringNullableFilter<"Tollgate"> | string | null
    createdAt?: DateTimeFilter<"Tollgate"> | Date | string
    updatedAt?: DateTimeFilter<"Tollgate"> | Date | string
  }

  export type ActivityEventUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: ActivityEventWhereUniqueInput
    update: XOR<ActivityEventUpdateWithoutOrganizationInput, ActivityEventUncheckedUpdateWithoutOrganizationInput>
    create: XOR<ActivityEventCreateWithoutOrganizationInput, ActivityEventUncheckedCreateWithoutOrganizationInput>
  }

  export type ActivityEventUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: ActivityEventWhereUniqueInput
    data: XOR<ActivityEventUpdateWithoutOrganizationInput, ActivityEventUncheckedUpdateWithoutOrganizationInput>
  }

  export type ActivityEventUpdateManyWithWhereWithoutOrganizationInput = {
    where: ActivityEventScalarWhereInput
    data: XOR<ActivityEventUpdateManyMutationInput, ActivityEventUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type ActivityEventScalarWhereInput = {
    AND?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
    OR?: ActivityEventScalarWhereInput[]
    NOT?: ActivityEventScalarWhereInput | ActivityEventScalarWhereInput[]
    id?: StringFilter<"ActivityEvent"> | string
    organizationId?: StringFilter<"ActivityEvent"> | string
    entityType?: EnumActivityEntityTypeFilter<"ActivityEvent"> | $Enums.ActivityEntityType
    entityId?: StringFilter<"ActivityEvent"> | string
    eventType?: EnumActivityEventTypeFilter<"ActivityEvent"> | $Enums.ActivityEventType
    actorId?: StringNullableFilter<"ActivityEvent"> | string | null
    metadata?: JsonNullableFilter<"ActivityEvent">
    createdAt?: DateTimeFilter<"ActivityEvent"> | Date | string
  }

  export type MembershipCreateWithoutUserInput = {
    id: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutMembershipsInput
  }

  export type MembershipUncheckedCreateWithoutUserInput = {
    id: string
    organizationId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MembershipCreateOrConnectWithoutUserInput = {
    where: MembershipWhereUniqueInput
    create: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput>
  }

  export type MembershipCreateManyUserInputEnvelope = {
    data: MembershipCreateManyUserInput | MembershipCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OutcomeCreateWithoutValueOwnerInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutOutcomesInput
    epics?: EpicCreateNestedManyWithoutOutcomeInput
    stories?: StoryCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUncheckedCreateWithoutValueOwnerInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    epics?: EpicUncheckedCreateNestedManyWithoutOutcomeInput
    stories?: StoryUncheckedCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeCreateOrConnectWithoutValueOwnerInput = {
    where: OutcomeWhereUniqueInput
    create: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput>
  }

  export type OutcomeCreateManyValueOwnerInputEnvelope = {
    data: OutcomeCreateManyValueOwnerInput | OutcomeCreateManyValueOwnerInput[]
    skipDuplicates?: boolean
  }

  export type TollgateCreateWithoutDecisionActorInput = {
    id: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutTollgatesInput
  }

  export type TollgateUncheckedCreateWithoutDecisionActorInput = {
    id: string
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateCreateOrConnectWithoutDecisionActorInput = {
    where: TollgateWhereUniqueInput
    create: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput>
  }

  export type TollgateCreateManyDecisionActorInputEnvelope = {
    data: TollgateCreateManyDecisionActorInput | TollgateCreateManyDecisionActorInput[]
    skipDuplicates?: boolean
  }

  export type ActivityEventCreateWithoutActorInput = {
    id: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutActivityEventsInput
  }

  export type ActivityEventUncheckedCreateWithoutActorInput = {
    id: string
    organizationId: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityEventCreateOrConnectWithoutActorInput = {
    where: ActivityEventWhereUniqueInput
    create: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput>
  }

  export type ActivityEventCreateManyActorInputEnvelope = {
    data: ActivityEventCreateManyActorInput | ActivityEventCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type MembershipUpsertWithWhereUniqueWithoutUserInput = {
    where: MembershipWhereUniqueInput
    update: XOR<MembershipUpdateWithoutUserInput, MembershipUncheckedUpdateWithoutUserInput>
    create: XOR<MembershipCreateWithoutUserInput, MembershipUncheckedCreateWithoutUserInput>
  }

  export type MembershipUpdateWithWhereUniqueWithoutUserInput = {
    where: MembershipWhereUniqueInput
    data: XOR<MembershipUpdateWithoutUserInput, MembershipUncheckedUpdateWithoutUserInput>
  }

  export type MembershipUpdateManyWithWhereWithoutUserInput = {
    where: MembershipScalarWhereInput
    data: XOR<MembershipUpdateManyMutationInput, MembershipUncheckedUpdateManyWithoutUserInput>
  }

  export type OutcomeUpsertWithWhereUniqueWithoutValueOwnerInput = {
    where: OutcomeWhereUniqueInput
    update: XOR<OutcomeUpdateWithoutValueOwnerInput, OutcomeUncheckedUpdateWithoutValueOwnerInput>
    create: XOR<OutcomeCreateWithoutValueOwnerInput, OutcomeUncheckedCreateWithoutValueOwnerInput>
  }

  export type OutcomeUpdateWithWhereUniqueWithoutValueOwnerInput = {
    where: OutcomeWhereUniqueInput
    data: XOR<OutcomeUpdateWithoutValueOwnerInput, OutcomeUncheckedUpdateWithoutValueOwnerInput>
  }

  export type OutcomeUpdateManyWithWhereWithoutValueOwnerInput = {
    where: OutcomeScalarWhereInput
    data: XOR<OutcomeUpdateManyMutationInput, OutcomeUncheckedUpdateManyWithoutValueOwnerInput>
  }

  export type TollgateUpsertWithWhereUniqueWithoutDecisionActorInput = {
    where: TollgateWhereUniqueInput
    update: XOR<TollgateUpdateWithoutDecisionActorInput, TollgateUncheckedUpdateWithoutDecisionActorInput>
    create: XOR<TollgateCreateWithoutDecisionActorInput, TollgateUncheckedCreateWithoutDecisionActorInput>
  }

  export type TollgateUpdateWithWhereUniqueWithoutDecisionActorInput = {
    where: TollgateWhereUniqueInput
    data: XOR<TollgateUpdateWithoutDecisionActorInput, TollgateUncheckedUpdateWithoutDecisionActorInput>
  }

  export type TollgateUpdateManyWithWhereWithoutDecisionActorInput = {
    where: TollgateScalarWhereInput
    data: XOR<TollgateUpdateManyMutationInput, TollgateUncheckedUpdateManyWithoutDecisionActorInput>
  }

  export type ActivityEventUpsertWithWhereUniqueWithoutActorInput = {
    where: ActivityEventWhereUniqueInput
    update: XOR<ActivityEventUpdateWithoutActorInput, ActivityEventUncheckedUpdateWithoutActorInput>
    create: XOR<ActivityEventCreateWithoutActorInput, ActivityEventUncheckedCreateWithoutActorInput>
  }

  export type ActivityEventUpdateWithWhereUniqueWithoutActorInput = {
    where: ActivityEventWhereUniqueInput
    data: XOR<ActivityEventUpdateWithoutActorInput, ActivityEventUncheckedUpdateWithoutActorInput>
  }

  export type ActivityEventUpdateManyWithWhereWithoutActorInput = {
    where: ActivityEventScalarWhereInput
    data: XOR<ActivityEventUpdateManyMutationInput, ActivityEventUncheckedUpdateManyWithoutActorInput>
  }

  export type OrganizationCreateWithoutMembershipsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutMembershipsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutMembershipsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutMembershipsInput, OrganizationUncheckedCreateWithoutMembershipsInput>
  }

  export type AppUserCreateWithoutMembershipsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedOutcomes?: OutcomeCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventCreateNestedManyWithoutActorInput
  }

  export type AppUserUncheckedCreateWithoutMembershipsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownedOutcomes?: OutcomeUncheckedCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateUncheckedCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutActorInput
  }

  export type AppUserCreateOrConnectWithoutMembershipsInput = {
    where: AppUserWhereUniqueInput
    create: XOR<AppUserCreateWithoutMembershipsInput, AppUserUncheckedCreateWithoutMembershipsInput>
  }

  export type OrganizationUpsertWithoutMembershipsInput = {
    update: XOR<OrganizationUpdateWithoutMembershipsInput, OrganizationUncheckedUpdateWithoutMembershipsInput>
    create: XOR<OrganizationCreateWithoutMembershipsInput, OrganizationUncheckedCreateWithoutMembershipsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutMembershipsInput, OrganizationUncheckedUpdateWithoutMembershipsInput>
  }

  export type OrganizationUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type AppUserUpsertWithoutMembershipsInput = {
    update: XOR<AppUserUpdateWithoutMembershipsInput, AppUserUncheckedUpdateWithoutMembershipsInput>
    create: XOR<AppUserCreateWithoutMembershipsInput, AppUserUncheckedCreateWithoutMembershipsInput>
    where?: AppUserWhereInput
  }

  export type AppUserUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: AppUserWhereInput
    data: XOR<AppUserUpdateWithoutMembershipsInput, AppUserUncheckedUpdateWithoutMembershipsInput>
  }

  export type AppUserUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedOutcomes?: OutcomeUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutActorNestedInput
  }

  export type AppUserUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownedOutcomes?: OutcomeUncheckedUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUncheckedUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type OrganizationCreateWithoutOutcomesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutOutcomesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutOutcomesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutOutcomesInput, OrganizationUncheckedCreateWithoutOutcomesInput>
  }

  export type AppUserCreateWithoutOwnedOutcomesInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutUserInput
    tollgateDecisions?: TollgateCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventCreateNestedManyWithoutActorInput
  }

  export type AppUserUncheckedCreateWithoutOwnedOutcomesInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutUserInput
    tollgateDecisions?: TollgateUncheckedCreateNestedManyWithoutDecisionActorInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutActorInput
  }

  export type AppUserCreateOrConnectWithoutOwnedOutcomesInput = {
    where: AppUserWhereUniqueInput
    create: XOR<AppUserCreateWithoutOwnedOutcomesInput, AppUserUncheckedCreateWithoutOwnedOutcomesInput>
  }

  export type EpicCreateWithoutOutcomeInput = {
    id: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEpicsInput
    stories?: StoryCreateNestedManyWithoutEpicInput
  }

  export type EpicUncheckedCreateWithoutOutcomeInput = {
    id: string
    organizationId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stories?: StoryUncheckedCreateNestedManyWithoutEpicInput
  }

  export type EpicCreateOrConnectWithoutOutcomeInput = {
    where: EpicWhereUniqueInput
    create: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput>
  }

  export type EpicCreateManyOutcomeInputEnvelope = {
    data: EpicCreateManyOutcomeInput | EpicCreateManyOutcomeInput[]
    skipDuplicates?: boolean
  }

  export type StoryCreateWithoutOutcomeInput = {
    id: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutStoriesInput
    epic: EpicCreateNestedOneWithoutStoriesInput
  }

  export type StoryUncheckedCreateWithoutOutcomeInput = {
    id: string
    organizationId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryCreateOrConnectWithoutOutcomeInput = {
    where: StoryWhereUniqueInput
    create: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput>
  }

  export type StoryCreateManyOutcomeInputEnvelope = {
    data: StoryCreateManyOutcomeInput | StoryCreateManyOutcomeInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithoutOutcomesInput = {
    update: XOR<OrganizationUpdateWithoutOutcomesInput, OrganizationUncheckedUpdateWithoutOutcomesInput>
    create: XOR<OrganizationCreateWithoutOutcomesInput, OrganizationUncheckedCreateWithoutOutcomesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutOutcomesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutOutcomesInput, OrganizationUncheckedUpdateWithoutOutcomesInput>
  }

  export type OrganizationUpdateWithoutOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type AppUserUpsertWithoutOwnedOutcomesInput = {
    update: XOR<AppUserUpdateWithoutOwnedOutcomesInput, AppUserUncheckedUpdateWithoutOwnedOutcomesInput>
    create: XOR<AppUserCreateWithoutOwnedOutcomesInput, AppUserUncheckedCreateWithoutOwnedOutcomesInput>
    where?: AppUserWhereInput
  }

  export type AppUserUpdateToOneWithWhereWithoutOwnedOutcomesInput = {
    where?: AppUserWhereInput
    data: XOR<AppUserUpdateWithoutOwnedOutcomesInput, AppUserUncheckedUpdateWithoutOwnedOutcomesInput>
  }

  export type AppUserUpdateWithoutOwnedOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutUserNestedInput
    tollgateDecisions?: TollgateUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutActorNestedInput
  }

  export type AppUserUncheckedUpdateWithoutOwnedOutcomesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutUserNestedInput
    tollgateDecisions?: TollgateUncheckedUpdateManyWithoutDecisionActorNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type EpicUpsertWithWhereUniqueWithoutOutcomeInput = {
    where: EpicWhereUniqueInput
    update: XOR<EpicUpdateWithoutOutcomeInput, EpicUncheckedUpdateWithoutOutcomeInput>
    create: XOR<EpicCreateWithoutOutcomeInput, EpicUncheckedCreateWithoutOutcomeInput>
  }

  export type EpicUpdateWithWhereUniqueWithoutOutcomeInput = {
    where: EpicWhereUniqueInput
    data: XOR<EpicUpdateWithoutOutcomeInput, EpicUncheckedUpdateWithoutOutcomeInput>
  }

  export type EpicUpdateManyWithWhereWithoutOutcomeInput = {
    where: EpicScalarWhereInput
    data: XOR<EpicUpdateManyMutationInput, EpicUncheckedUpdateManyWithoutOutcomeInput>
  }

  export type StoryUpsertWithWhereUniqueWithoutOutcomeInput = {
    where: StoryWhereUniqueInput
    update: XOR<StoryUpdateWithoutOutcomeInput, StoryUncheckedUpdateWithoutOutcomeInput>
    create: XOR<StoryCreateWithoutOutcomeInput, StoryUncheckedCreateWithoutOutcomeInput>
  }

  export type StoryUpdateWithWhereUniqueWithoutOutcomeInput = {
    where: StoryWhereUniqueInput
    data: XOR<StoryUpdateWithoutOutcomeInput, StoryUncheckedUpdateWithoutOutcomeInput>
  }

  export type StoryUpdateManyWithWhereWithoutOutcomeInput = {
    where: StoryScalarWhereInput
    data: XOR<StoryUpdateManyMutationInput, StoryUncheckedUpdateManyWithoutOutcomeInput>
  }

  export type OrganizationCreateWithoutEpicsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutEpicsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutEpicsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutEpicsInput, OrganizationUncheckedCreateWithoutEpicsInput>
  }

  export type OutcomeCreateWithoutEpicsInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutOutcomesInput
    valueOwner?: AppUserCreateNestedOneWithoutOwnedOutcomesInput
    stories?: StoryCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUncheckedCreateWithoutEpicsInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    stories?: StoryUncheckedCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeCreateOrConnectWithoutEpicsInput = {
    where: OutcomeWhereUniqueInput
    create: XOR<OutcomeCreateWithoutEpicsInput, OutcomeUncheckedCreateWithoutEpicsInput>
  }

  export type StoryCreateWithoutEpicInput = {
    id: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutStoriesInput
    outcome: OutcomeCreateNestedOneWithoutStoriesInput
  }

  export type StoryUncheckedCreateWithoutEpicInput = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryCreateOrConnectWithoutEpicInput = {
    where: StoryWhereUniqueInput
    create: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput>
  }

  export type StoryCreateManyEpicInputEnvelope = {
    data: StoryCreateManyEpicInput | StoryCreateManyEpicInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithoutEpicsInput = {
    update: XOR<OrganizationUpdateWithoutEpicsInput, OrganizationUncheckedUpdateWithoutEpicsInput>
    create: XOR<OrganizationCreateWithoutEpicsInput, OrganizationUncheckedCreateWithoutEpicsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutEpicsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutEpicsInput, OrganizationUncheckedUpdateWithoutEpicsInput>
  }

  export type OrganizationUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OutcomeUpsertWithoutEpicsInput = {
    update: XOR<OutcomeUpdateWithoutEpicsInput, OutcomeUncheckedUpdateWithoutEpicsInput>
    create: XOR<OutcomeCreateWithoutEpicsInput, OutcomeUncheckedCreateWithoutEpicsInput>
    where?: OutcomeWhereInput
  }

  export type OutcomeUpdateToOneWithWhereWithoutEpicsInput = {
    where?: OutcomeWhereInput
    data: XOR<OutcomeUpdateWithoutEpicsInput, OutcomeUncheckedUpdateWithoutEpicsInput>
  }

  export type OutcomeUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutOutcomesNestedInput
    valueOwner?: AppUserUpdateOneWithoutOwnedOutcomesNestedInput
    stories?: StoryUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateWithoutEpicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stories?: StoryUncheckedUpdateManyWithoutOutcomeNestedInput
  }

  export type StoryUpsertWithWhereUniqueWithoutEpicInput = {
    where: StoryWhereUniqueInput
    update: XOR<StoryUpdateWithoutEpicInput, StoryUncheckedUpdateWithoutEpicInput>
    create: XOR<StoryCreateWithoutEpicInput, StoryUncheckedCreateWithoutEpicInput>
  }

  export type StoryUpdateWithWhereUniqueWithoutEpicInput = {
    where: StoryWhereUniqueInput
    data: XOR<StoryUpdateWithoutEpicInput, StoryUncheckedUpdateWithoutEpicInput>
  }

  export type StoryUpdateManyWithWhereWithoutEpicInput = {
    where: StoryScalarWhereInput
    data: XOR<StoryUpdateManyMutationInput, StoryUncheckedUpdateManyWithoutEpicInput>
  }

  export type OrganizationCreateWithoutStoriesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutStoriesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutStoriesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutStoriesInput, OrganizationUncheckedCreateWithoutStoriesInput>
  }

  export type OutcomeCreateWithoutStoriesInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutOutcomesInput
    valueOwner?: AppUserCreateNestedOneWithoutOwnedOutcomesInput
    epics?: EpicCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeUncheckedCreateWithoutStoriesInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    epics?: EpicUncheckedCreateNestedManyWithoutOutcomeInput
  }

  export type OutcomeCreateOrConnectWithoutStoriesInput = {
    where: OutcomeWhereUniqueInput
    create: XOR<OutcomeCreateWithoutStoriesInput, OutcomeUncheckedCreateWithoutStoriesInput>
  }

  export type EpicCreateWithoutStoriesInput = {
    id: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutEpicsInput
    outcome: OutcomeCreateNestedOneWithoutEpicsInput
  }

  export type EpicUncheckedCreateWithoutStoriesInput = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EpicCreateOrConnectWithoutStoriesInput = {
    where: EpicWhereUniqueInput
    create: XOR<EpicCreateWithoutStoriesInput, EpicUncheckedCreateWithoutStoriesInput>
  }

  export type OrganizationUpsertWithoutStoriesInput = {
    update: XOR<OrganizationUpdateWithoutStoriesInput, OrganizationUncheckedUpdateWithoutStoriesInput>
    create: XOR<OrganizationCreateWithoutStoriesInput, OrganizationUncheckedCreateWithoutStoriesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutStoriesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutStoriesInput, OrganizationUncheckedUpdateWithoutStoriesInput>
  }

  export type OrganizationUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type OutcomeUpsertWithoutStoriesInput = {
    update: XOR<OutcomeUpdateWithoutStoriesInput, OutcomeUncheckedUpdateWithoutStoriesInput>
    create: XOR<OutcomeCreateWithoutStoriesInput, OutcomeUncheckedCreateWithoutStoriesInput>
    where?: OutcomeWhereInput
  }

  export type OutcomeUpdateToOneWithWhereWithoutStoriesInput = {
    where?: OutcomeWhereInput
    data: XOR<OutcomeUpdateWithoutStoriesInput, OutcomeUncheckedUpdateWithoutStoriesInput>
  }

  export type OutcomeUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutOutcomesNestedInput
    valueOwner?: AppUserUpdateOneWithoutOwnedOutcomesNestedInput
    epics?: EpicUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    epics?: EpicUncheckedUpdateManyWithoutOutcomeNestedInput
  }

  export type EpicUpsertWithoutStoriesInput = {
    update: XOR<EpicUpdateWithoutStoriesInput, EpicUncheckedUpdateWithoutStoriesInput>
    create: XOR<EpicCreateWithoutStoriesInput, EpicUncheckedCreateWithoutStoriesInput>
    where?: EpicWhereInput
  }

  export type EpicUpdateToOneWithWhereWithoutStoriesInput = {
    where?: EpicWhereInput
    data: XOR<EpicUpdateWithoutStoriesInput, EpicUncheckedUpdateWithoutStoriesInput>
  }

  export type EpicUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEpicsNestedInput
    outcome?: OutcomeUpdateOneRequiredWithoutEpicsNestedInput
  }

  export type EpicUncheckedUpdateWithoutStoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationCreateWithoutTollgatesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutTollgatesInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutTollgatesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutTollgatesInput, OrganizationUncheckedCreateWithoutTollgatesInput>
  }

  export type AppUserCreateWithoutTollgateDecisionsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeCreateNestedManyWithoutValueOwnerInput
    activityEvents?: ActivityEventCreateNestedManyWithoutActorInput
  }

  export type AppUserUncheckedCreateWithoutTollgateDecisionsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeUncheckedCreateNestedManyWithoutValueOwnerInput
    activityEvents?: ActivityEventUncheckedCreateNestedManyWithoutActorInput
  }

  export type AppUserCreateOrConnectWithoutTollgateDecisionsInput = {
    where: AppUserWhereUniqueInput
    create: XOR<AppUserCreateWithoutTollgateDecisionsInput, AppUserUncheckedCreateWithoutTollgateDecisionsInput>
  }

  export type OrganizationUpsertWithoutTollgatesInput = {
    update: XOR<OrganizationUpdateWithoutTollgatesInput, OrganizationUncheckedUpdateWithoutTollgatesInput>
    create: XOR<OrganizationCreateWithoutTollgatesInput, OrganizationUncheckedCreateWithoutTollgatesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutTollgatesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutTollgatesInput, OrganizationUncheckedUpdateWithoutTollgatesInput>
  }

  export type OrganizationUpdateWithoutTollgatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutTollgatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type AppUserUpsertWithoutTollgateDecisionsInput = {
    update: XOR<AppUserUpdateWithoutTollgateDecisionsInput, AppUserUncheckedUpdateWithoutTollgateDecisionsInput>
    create: XOR<AppUserCreateWithoutTollgateDecisionsInput, AppUserUncheckedCreateWithoutTollgateDecisionsInput>
    where?: AppUserWhereInput
  }

  export type AppUserUpdateToOneWithWhereWithoutTollgateDecisionsInput = {
    where?: AppUserWhereInput
    data: XOR<AppUserUpdateWithoutTollgateDecisionsInput, AppUserUncheckedUpdateWithoutTollgateDecisionsInput>
  }

  export type AppUserUpdateWithoutTollgateDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUpdateManyWithoutValueOwnerNestedInput
    activityEvents?: ActivityEventUpdateManyWithoutActorNestedInput
  }

  export type AppUserUncheckedUpdateWithoutTollgateDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUncheckedUpdateManyWithoutValueOwnerNestedInput
    activityEvents?: ActivityEventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type OrganizationCreateWithoutActivityEventsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeCreateNestedManyWithoutOrganizationInput
    epics?: EpicCreateNestedManyWithoutOrganizationInput
    stories?: StoryCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutActivityEventsInput = {
    id: string
    slug: string
    name: string
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutOrganizationInput
    outcomes?: OutcomeUncheckedCreateNestedManyWithoutOrganizationInput
    epics?: EpicUncheckedCreateNestedManyWithoutOrganizationInput
    stories?: StoryUncheckedCreateNestedManyWithoutOrganizationInput
    tollgates?: TollgateUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutActivityEventsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutActivityEventsInput, OrganizationUncheckedCreateWithoutActivityEventsInput>
  }

  export type AppUserCreateWithoutActivityEventsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateCreateNestedManyWithoutDecisionActorInput
  }

  export type AppUserUncheckedCreateWithoutActivityEventsInput = {
    id: string
    email: string
    fullName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    memberships?: MembershipUncheckedCreateNestedManyWithoutUserInput
    ownedOutcomes?: OutcomeUncheckedCreateNestedManyWithoutValueOwnerInput
    tollgateDecisions?: TollgateUncheckedCreateNestedManyWithoutDecisionActorInput
  }

  export type AppUserCreateOrConnectWithoutActivityEventsInput = {
    where: AppUserWhereUniqueInput
    create: XOR<AppUserCreateWithoutActivityEventsInput, AppUserUncheckedCreateWithoutActivityEventsInput>
  }

  export type OrganizationUpsertWithoutActivityEventsInput = {
    update: XOR<OrganizationUpdateWithoutActivityEventsInput, OrganizationUncheckedUpdateWithoutActivityEventsInput>
    create: XOR<OrganizationCreateWithoutActivityEventsInput, OrganizationUncheckedCreateWithoutActivityEventsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutActivityEventsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutActivityEventsInput, OrganizationUncheckedUpdateWithoutActivityEventsInput>
  }

  export type OrganizationUpdateWithoutActivityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUpdateManyWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutActivityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutOrganizationNestedInput
    outcomes?: OutcomeUncheckedUpdateManyWithoutOrganizationNestedInput
    epics?: EpicUncheckedUpdateManyWithoutOrganizationNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOrganizationNestedInput
    tollgates?: TollgateUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type AppUserUpsertWithoutActivityEventsInput = {
    update: XOR<AppUserUpdateWithoutActivityEventsInput, AppUserUncheckedUpdateWithoutActivityEventsInput>
    create: XOR<AppUserCreateWithoutActivityEventsInput, AppUserUncheckedCreateWithoutActivityEventsInput>
    where?: AppUserWhereInput
  }

  export type AppUserUpdateToOneWithWhereWithoutActivityEventsInput = {
    where?: AppUserWhereInput
    data: XOR<AppUserUpdateWithoutActivityEventsInput, AppUserUncheckedUpdateWithoutActivityEventsInput>
  }

  export type AppUserUpdateWithoutActivityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUpdateManyWithoutDecisionActorNestedInput
  }

  export type AppUserUncheckedUpdateWithoutActivityEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    fullName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: MembershipUncheckedUpdateManyWithoutUserNestedInput
    ownedOutcomes?: OutcomeUncheckedUpdateManyWithoutValueOwnerNestedInput
    tollgateDecisions?: TollgateUncheckedUpdateManyWithoutDecisionActorNestedInput
  }

  export type MembershipCreateManyOrganizationInput = {
    id: string
    userId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutcomeCreateManyOrganizationInput = {
    id: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    valueOwnerId?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EpicCreateManyOrganizationInput = {
    id: string
    outcomeId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryCreateManyOrganizationInput = {
    id: string
    outcomeId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateCreateManyOrganizationInput = {
    id: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: string | null
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityEventCreateManyOrganizationInput = {
    id: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    actorId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type MembershipUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: AppUserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MembershipUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    valueOwner?: AppUserUpdateOneWithoutOwnedOutcomesNestedInput
    epics?: EpicUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    epics?: EpicUncheckedUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    valueOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcome?: OutcomeUpdateOneRequiredWithoutEpicsNestedInput
    stories?: StoryUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stories?: StoryUncheckedUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outcome?: OutcomeUpdateOneRequiredWithoutStoriesNestedInput
    epic?: EpicUpdateOneRequiredWithoutStoriesNestedInput
  }

  export type StoryUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisionActor?: AppUserUpdateOneWithoutTollgateDecisionsNestedInput
  }

  export type TollgateUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: NullableStringFieldUpdateOperationsInput | string | null
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedBy?: NullableStringFieldUpdateOperationsInput | string | null
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: AppUserUpdateOneWithoutActivityEventsNestedInput
  }

  export type ActivityEventUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipCreateManyUserInput = {
    id: string
    organizationId: string
    role: $Enums.MembershipRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OutcomeCreateManyValueOwnerInput = {
    id: string
    organizationId: string
    key: string
    title: string
    problemStatement?: string | null
    outcomeStatement?: string | null
    baselineDefinition?: string | null
    baselineSource?: string | null
    timeframe?: string | null
    riskProfile?: $Enums.RiskProfile
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    status?: $Enums.OutcomeStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TollgateCreateManyDecisionActorInput = {
    id: string
    organizationId: string
    entityType: $Enums.TollgateEntityType
    entityId: string
    tollgateType: $Enums.TollgateType
    status?: $Enums.TollgateStatus
    blockers?: TollgateCreateblockersInput | string[]
    approverRoles?: TollgateCreateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: Date | string | null
    comments?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityEventCreateManyActorInput = {
    id: string
    organizationId: string
    entityType: $Enums.ActivityEntityType
    entityId: string
    eventType: $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type MembershipUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type MembershipUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MembershipUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    role?: EnumMembershipRoleFieldUpdateOperationsInput | $Enums.MembershipRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutcomeUpdateWithoutValueOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutOutcomesNestedInput
    epics?: EpicUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateWithoutValueOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    epics?: EpicUncheckedUpdateManyWithoutOutcomeNestedInput
    stories?: StoryUncheckedUpdateManyWithoutOutcomeNestedInput
  }

  export type OutcomeUncheckedUpdateManyWithoutValueOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    problemStatement?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeStatement?: NullableStringFieldUpdateOperationsInput | string | null
    baselineDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    baselineSource?: NullableStringFieldUpdateOperationsInput | string | null
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    riskProfile?: EnumRiskProfileFieldUpdateOperationsInput | $Enums.RiskProfile
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    status?: EnumOutcomeStatusFieldUpdateOperationsInput | $Enums.OutcomeStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateUpdateWithoutDecisionActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutTollgatesNestedInput
  }

  export type TollgateUncheckedUpdateWithoutDecisionActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TollgateUncheckedUpdateManyWithoutDecisionActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumTollgateEntityTypeFieldUpdateOperationsInput | $Enums.TollgateEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    tollgateType?: EnumTollgateTypeFieldUpdateOperationsInput | $Enums.TollgateType
    status?: EnumTollgateStatusFieldUpdateOperationsInput | $Enums.TollgateStatus
    blockers?: TollgateUpdateblockersInput | string[]
    approverRoles?: TollgateUpdateapproverRolesInput | $Enums.MembershipRole[]
    decidedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    comments?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutActivityEventsNestedInput
  }

  export type ActivityEventUncheckedUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityEventUncheckedUpdateManyWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    entityType?: EnumActivityEntityTypeFieldUpdateOperationsInput | $Enums.ActivityEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    eventType?: EnumActivityEventTypeFieldUpdateOperationsInput | $Enums.ActivityEventType
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EpicCreateManyOutcomeInput = {
    id: string
    organizationId: string
    key: string
    title: string
    purpose: string
    status?: $Enums.EpicStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryCreateManyOutcomeInput = {
    id: string
    organizationId: string
    epicId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EpicUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutEpicsNestedInput
    stories?: StoryUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stories?: StoryUncheckedUpdateManyWithoutEpicNestedInput
  }

  export type EpicUncheckedUpdateManyWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    purpose?: StringFieldUpdateOperationsInput | string
    status?: EnumEpicStatusFieldUpdateOperationsInput | $Enums.EpicStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutStoriesNestedInput
    epic?: EpicUpdateOneRequiredWithoutStoriesNestedInput
  }

  export type StoryUncheckedUpdateWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUncheckedUpdateManyWithoutOutcomeInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    epicId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryCreateManyEpicInput = {
    id: string
    organizationId: string
    outcomeId: string
    key: string
    title: string
    storyType: $Enums.StoryType
    valueIntent: string
    acceptanceCriteria?: StoryCreateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryCreateaiUsageScopeInput | string[]
    aiAccelerationLevel?: $Enums.AiAccelerationLevel
    testDefinition?: string | null
    definitionOfDone?: StoryCreatedefinitionOfDoneInput | string[]
    status?: $Enums.StoryStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StoryUpdateWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutStoriesNestedInput
    outcome?: OutcomeUpdateOneRequiredWithoutStoriesNestedInput
  }

  export type StoryUncheckedUpdateWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StoryUncheckedUpdateManyWithoutEpicInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    outcomeId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    storyType?: EnumStoryTypeFieldUpdateOperationsInput | $Enums.StoryType
    valueIntent?: StringFieldUpdateOperationsInput | string
    acceptanceCriteria?: StoryUpdateacceptanceCriteriaInput | string[]
    aiUsageScope?: StoryUpdateaiUsageScopeInput | string[]
    aiAccelerationLevel?: EnumAiAccelerationLevelFieldUpdateOperationsInput | $Enums.AiAccelerationLevel
    testDefinition?: NullableStringFieldUpdateOperationsInput | string | null
    definitionOfDone?: StoryUpdatedefinitionOfDoneInput | string[]
    status?: EnumStoryStatusFieldUpdateOperationsInput | $Enums.StoryStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}