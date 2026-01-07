export {}
// declare global{
//   namespace Express{
//     interface Request{
//       userId?: string
//     }

//   }
// }
declare global{
  namespace Express{
    interface Request{
      userId?: string,
      sessions?: string[]
    }
  }
}