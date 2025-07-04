export type CameraType = {
  id?: number;
  uniqueId: string;
  title?: string;
  ip?: string;
  mac?: string;
  model?: string;
  vendor?: string;
  port?: string;
  username?: string;
  password?: string;
  notes?: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  show: boolean;
};
