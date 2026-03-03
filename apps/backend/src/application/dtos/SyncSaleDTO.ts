import { RegisterSaleItemDTO, RegisterSalePaymentDTO } from "./RegisterSaleDTO";

export interface SyncSaleDTO {
    id: string; // ID generado en el cliente (Offline-First)
    customerId?: string;
    items: SyncSaleItemDTO[];
    payments: SyncSalePaymentDTO[];
}

export interface SyncSaleItemDTO extends RegisterSaleItemDTO {
    id: string; // Opcional o requerido, asume frontend uuid
}

export interface SyncSalePaymentDTO extends RegisterSalePaymentDTO {
    id: string;
}
