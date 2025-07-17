export type AcType = {
  id?: number;
  uniqueId: string;
  title?: string;
  ip?: string;
  mac?: string;
  model?: string;
  vendor?: string;

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
  mode?: string;
  show: boolean;
};
