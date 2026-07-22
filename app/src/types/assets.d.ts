// Cho phép require()/import file asset qua Metro (trả về module id number).
declare module '*.gpx' {
  const asset: number;
  export default asset;
}
declare module '*.png' {
  const asset: number;
  export default asset;
}
declare module '*.otf' {
  const asset: number;
  export default asset;
}
