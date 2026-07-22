// Cho phép require()/import file .gpx như asset (Metro trả về module id number).
declare module '*.gpx' {
  const asset: number;
  export default asset;
}
