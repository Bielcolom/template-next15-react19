const serverOnlyMock = {};

export default serverOnlyMock;
// En tests (Vitest/Node) no existe el paquete real server-only que Next usa para marcar módulos “solo servidor”.
//En runtime de Next eso está bien, pero en Vitest falla con “Cannot find package 'server-only'”.
