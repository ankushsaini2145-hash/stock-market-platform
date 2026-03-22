import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

actor {
  type TickerSymbol = Text;
  type NoteContent = Text;

  type BuyOrder = {
    tickerSymbol : TickerSymbol;
    quantity : Nat;
    price : Float;
  };

  type SellOrder = {
    tickerSymbol : TickerSymbol;
    quantity : Nat;
    price : Float;
  };

  type Order = {
    tickerSymbol : TickerSymbol;
    quantity : Int;
    price : Float;
  };

  type Trade = {
    tickerSymbol : TickerSymbol;
    quantity : Int;
    price : Float;
    timestamp : Time.Time;
  };

  type Position = {
    tickerSymbol : TickerSymbol;
    quantity : Int;
    avgPrice : Float;
  };

  type Portfolio = {
    cashBalance : Float;
    trades : [Trade];
    positions : [Position];
  };

  type BacktestConfig = {
    strategyName : Text;
    asset : TickerSymbol;
    startDate : Time.Time;
    endDate : Time.Time;
  };

  type BacktestResult = {
    config : BacktestConfig;
    returnPercent : Float;
    maxDrawdownPercent : Float;
  };

  module TickerSymbol {
    public func compare(symbol1 : TickerSymbol, symbol2 : TickerSymbol) : Order.Order {
      Text.compare(symbol1, symbol2);
    };
  };

  module NoteContent {
    public func compareBySymbol((symbol1, _) : (TickerSymbol, NoteContent), (symbol2, _) : (TickerSymbol, NoteContent)) : Order.Order {
      TickerSymbol.compare(symbol1, symbol2);
    };
  };

  module Position {
    public func compareByPnl(position1 : Position, position2 : Position) : Order.Order {
      Float.compare(position1.avgPrice, position2.avgPrice);
    };
  };

  module BacktestResult {
    public func compareByReturn(result1 : BacktestResult, result2 : BacktestResult) : Order.Order {
      Float.compare(result2.returnPercent, result1.returnPercent);
    };
  };

  module Trade {
    public func compareByTimestamp(trade1 : Trade, trade2 : Trade) : Order.Order {
      Int.compare(trade1.timestamp, trade2.timestamp);
    };
  };

  let users = Map.empty<Principal, Portfolio>();
  let watchlists = Map.empty<Principal, Set.Set<TickerSymbol>>();
  let stockNotes = Map.empty<Principal, Map.Map<TickerSymbol, NoteContent>>();
  let backtestResults = Map.empty<Principal, [BacktestResult]>();

  func getPortfolioInternal(caller : Principal) : Portfolio {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?portfolio) { portfolio };
    };
  };

  func getPositionBySymbol(positions : [Position], symbol : TickerSymbol) : ?Position {
    positions.find(func(position) { position.tickerSymbol == symbol });
  };

  public shared ({ caller }) func createPortfolio() : async Portfolio {
    let defaultPortfolio : Portfolio = {
      cashBalance = 100_000.0;
      trades = [];
      positions = [];
    };
    users.add(caller, defaultPortfolio);
    defaultPortfolio;
  };

  public query ({ caller }) func getPortfolio() : async Portfolio {
    let portfolio = getPortfolioInternal(caller);
    {
      trades = portfolio.trades.sort(Trade.compareByTimestamp);
      positions = portfolio.positions;
      cashBalance = portfolio.cashBalance;
    };
  };

  func updatePositions(positions : [Position], order : Order) : [Position] {
    positions.map(
      func(position) {
        if (position.tickerSymbol == order.tickerSymbol) {
          {
            position with
            quantity = position.quantity + order.quantity;
            avgPrice = order.price;
          };
        } else {
          position;
        };
      }
    );
  };

  func addNewPosition(positions : [Position], newPosition : Position) : [Position] {
    positions.concat([newPosition]);
  };

  public shared ({ caller }) func placeBuyOrder(order : BuyOrder) : async Portfolio {
    let portfolio = getPortfolioInternal(caller);

    if (order.quantity <= 0 or order.price <= 0.0) {
      Runtime.trap("Invalid order parameters");
    };

    let newTrade : Trade = {
      tickerSymbol = order.tickerSymbol;
      quantity = order.quantity;
      price = order.price;
      timestamp = Time.now();
    };

    switch (getPositionBySymbol(portfolio.positions, order.tickerSymbol)) {
      case (null) {
        let newPosition : Position = {
          tickerSymbol = order.tickerSymbol;
          quantity = order.quantity;
          avgPrice = order.price;
        };
        let updatedPortfolio : Portfolio = {
          cashBalance = portfolio.cashBalance - (order.quantity.toFloat() * order.price);
          trades = portfolio.trades.concat([newTrade]);
          positions = addNewPosition(portfolio.positions, newPosition);
        };
        users.add(caller, updatedPortfolio);
        updatedPortfolio;
      };
      case (?position1) {
        let updatedPositions = updatePositions(
          portfolio.positions,
          { tickerSymbol = order.tickerSymbol; quantity = order.quantity; price = order.price },
        );
        let updatedPortfolio : Portfolio = {
          cashBalance = portfolio.cashBalance - (order.quantity.toFloat() * order.price);
          trades = portfolio.trades.concat([newTrade]);
          positions = updatedPositions;
        };
        users.add(caller, updatedPortfolio);
        updatedPortfolio;
      };
    };
  };

  public shared ({ caller }) func placeSellOrder(order : SellOrder) : async Portfolio {
    let portfolio = getPortfolioInternal(caller);

    if (order.quantity <= 0 or order.price <= 0.0) {
      Runtime.trap("Invalid order parameters");
    };

    switch (getPositionBySymbol(portfolio.positions, order.tickerSymbol)) {
      case (null) { Runtime.trap("No position exists for the given stock") };
      case (?position1) {
        if (order.quantity > position1.quantity) {
          Runtime.trap("Not enough shares available to sell");
        };

        let newTrade : Trade = {
          tickerSymbol = order.tickerSymbol;
          quantity = -order.quantity;
          price = order.price;
          timestamp = Time.now();
        };

        let updatedPositions = updatePositions(
          portfolio.positions,
          { tickerSymbol = order.tickerSymbol; quantity = -order.quantity; price = order.price },
        );
        let updatedPortfolio : Portfolio = {
          cashBalance = portfolio.cashBalance + (order.quantity.toFloat() * order.price);
          trades = portfolio.trades.concat([newTrade]);
          positions = updatedPositions;
        };
        users.add(caller, updatedPortfolio);
        updatedPortfolio;
      };
    };
  };

  public shared ({ caller }) func addToWatchlist(symbol : Text) : async () {
    let (_, existingWatchlist) = switch (watchlists.get(caller)) {
      case (null) {
        let newSet = Set.empty<TickerSymbol>();
        newSet.add(TickerSymbol.compare, symbol);
        (symbol, newSet);
      };
      case (?existingSet) {
        let alreadyInWatchlist = existingSet.contains(TickerSymbol.compare, symbol);
        if (alreadyInWatchlist) { Runtime.trap("Symbol already in watchlist") };
        existingSet.add(TickerSymbol.compare, symbol);
        (symbol, existingSet);
      };
    };
    watchlists.add(caller, existingWatchlist);
  };

  public shared ({ caller }) func removeFromWatchlist(symbol : Text) : async () {
    switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Watchlist does not exist") };
      case (?watchlist) {
        let alreadyInWatchlist = watchlist.contains(TickerSymbol.compare, symbol);
        if (not alreadyInWatchlist) { Runtime.trap("Symbol is not in watchlist") };
        watchlist.remove(TickerSymbol.compare, symbol);
      };
    };
  };

  public query ({ caller }) func getWatchlist() : async {
    watchlist : [Text];
    size : Nat;
  } {
    let watchlist = watchlists.get(caller);
    switch (watchlist) {
      case (null) { Runtime.trap("This user doesn't have an existing watchlsit") };
      case (?watchlist) {
        {
          watchlist = watchlist.toArray().sort(TickerSymbol.compare);
          size = watchlist.size();
        };
      };
    };
  };

  public shared ({ caller }) func createOrUpdateNote(tickerSymbol : TickerSymbol, content : NoteContent) : async NoteContent {
    switch (stockNotes.get(caller)) {
      case (null) {
        let newNoteMap = Map.empty<TickerSymbol, NoteContent>();
        newNoteMap.add(TickerSymbol.compare, tickerSymbol, content);
        stockNotes.add(caller, newNoteMap);
        content;
      };
      case (?notes) {
        notes.add(TickerSymbol.compare, tickerSymbol, content);
        content;
      };
    };
  };

  public query ({ caller }) func getNotes(caller : Principal) : async [(TickerSymbol, NoteContent)] {
    switch (stockNotes.get(caller)) {
      case (null) {
        Runtime.trap("You don't have any notes saved");
      };
      case (?notes) { notes.toArray().sort(NoteContent.compareBySymbol) };
    };
  };

  public shared ({ caller }) func saveBacktestResult(result : BacktestResult) : async [BacktestResult] {
    let userResults = switch (backtestResults.get(caller)) {
      case (null) { [result] };
      case (?results) { results.concat([result]) };
    };
    backtestResults.add(caller, userResults);
    userResults.sort(BacktestResult.compareByReturn);
  };
};
