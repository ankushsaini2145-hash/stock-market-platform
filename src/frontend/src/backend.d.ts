import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type NoteContent = string;
export interface SellOrder {
    tickerSymbol: TickerSymbol;
    quantity: bigint;
    price: number;
}
export type Time = bigint;
export interface Position {
    avgPrice: number;
    tickerSymbol: TickerSymbol;
    quantity: bigint;
}
export interface BacktestResult {
    returnPercent: number;
    maxDrawdownPercent: number;
    config: BacktestConfig;
}
export interface Trade {
    tickerSymbol: TickerSymbol;
    timestamp: Time;
    quantity: bigint;
    price: number;
}
export type TickerSymbol = string;
export interface Portfolio {
    trades: Array<Trade>;
    cashBalance: number;
    positions: Array<Position>;
}
export interface BacktestConfig {
    endDate: Time;
    asset: TickerSymbol;
    strategyName: string;
    startDate: Time;
}
export interface BuyOrder {
    tickerSymbol: TickerSymbol;
    quantity: bigint;
    price: number;
}
export interface backendInterface {
    addToWatchlist(symbol: string): Promise<void>;
    createOrUpdateNote(tickerSymbol: TickerSymbol, content: NoteContent): Promise<NoteContent>;
    createPortfolio(): Promise<Portfolio>;
    getNotes(caller: Principal): Promise<Array<[TickerSymbol, NoteContent]>>;
    getPortfolio(): Promise<Portfolio>;
    getWatchlist(): Promise<{
        size: bigint;
        watchlist: Array<string>;
    }>;
    placeBuyOrder(order: BuyOrder): Promise<Portfolio>;
    placeSellOrder(order: SellOrder): Promise<Portfolio>;
    removeFromWatchlist(symbol: string): Promise<void>;
    saveBacktestResult(result: BacktestResult): Promise<Array<BacktestResult>>;
}
