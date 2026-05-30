import { socketService } from '../services/socket.service';

export const io = new Proxy({}, {
  get: (target, prop) => {
    const internalIo = socketService.getIo();
    if (internalIo) {
      const val = (internalIo as any)[prop];
      if (typeof val === 'function') {
        return val.bind(internalIo);
      }
      return val;
    }
    return undefined;
  }
}) as any;

export const initSocket = (server: any) => {
  // Handled entirely by socketService.init(server) in server.ts
};
