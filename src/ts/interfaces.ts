interface Imeta {
    small: boolean,
    grad: string;
}

interface Iperson {
    fac: string,
    usl: string;
    stream: string,
}

interface Idata {
    [key: string]: Iperson;
}

interface IJson {
    info: Imeta;
    data: Idata;
}

export type { Imeta, Iperson, Idata, IJson };