export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
}
type JoinType = 'INNER' | 'LEFT' | 'RIGHT';
export type SearchOperator =
  | 'cn'
  | 'nc'
  | 'eq'
  | 'ne'
  | 'bw'
  | 'bn'
  | 'ew'
  | 'en'
  | 'nu'
  | 'nn'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'in'
  | 'inm';
type EnumName = 'STATUS' | 'PRIORITY' | 'JS_DATE';
export interface FilterField {
  field: string;
  joinType?: JoinType;
  value: any;
  operation: SearchOperator;
  enumName?: EnumName;
  values?: any[];
  alternatives?: FilterField[];
}
type Direction = 'ASC' | 'DESC';
export interface SearchCriteria {
  filterFields: FilterField[];
  direction?: Direction;
  pageNum?: number;
  pageSize?: number;
}
export const getInitialPage = <T>(): Page<T> => {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    last: true,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    empty: true,
    sort: { empty: true, sorted: true, unsorted: false }
  };
};
