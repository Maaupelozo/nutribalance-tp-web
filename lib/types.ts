export type Patient={id:number;name:string;age:number;dni:string;goal:string;os:string;active:boolean;allergies:string;notes:string;email?:string;phone?:string};
export type Visit={id:number;patient:number;date:string;weight:number;height:number;fat:number;muscle:number;waist:number;hip:number;notes:string;goal:string;draft:boolean;reason?:string;indications?:string;appointmentId?:number;custom?:Record<string,string>};
export type Appointment={id:number;patient:number;date:string;time:string;duration:number;type:string;mode:string;confirmed:boolean;status:string;source?:string;requestCode?:string;requestNotes?:string};
export type Doc={id:number;patient:number;title:string;category:string;date:string;shared:boolean;url:string;notes:string};
export type Payment={id:number;patient:number;date:string;total:number;paid:number;concept:string;method:string;token:string};
export type Entry={id:number;patient:number;date:string;photo:string;comment:string;water:number;sleep:number;activity:number};
export type Block={id:number;date:string;time:string;duration:number;reason:string};
export type Data={patients:Patient[];visits:Visit[];appointments:Appointment[];docs:Doc[];payments:Payment[];entries:Entry[];blocks:Block[];fields:{name:string;unit:string;active:boolean}[];questions:{id:number;patient:number;text:string}[];profile:{name:string;clinic:string;registration:string;retention:number};tokens?:Record<string,string>;requests?:{patient:number;period:string;notes:string}[]};

export type CoreData = Pick<Data, "patients" | "visits" | "appointments" | "blocks">;
export type CoreSnapshot = CoreData & { revision: number };
