import http from "http";
import {
  io,
  findPlayer,
  findRoom,
  checkUserUnique,
  isQueryParams,
} from "../app.js";
import { app } from "../app.js";
import { Server } from "socket.io";
import Client from "socket.io-client";
import Player from "../classes/Player.js";
import Room from "../classes/Room.js";
import Board from "../classes/Board.js";
import {
  jest,
  describe,
  expect,
  test,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import request from "supertest";

let httpServer: http.Server;
let ioServer: Server;
let port: number;
let clientSocket: any;

beforeAll((done) => {
  httpServer = http.createServer(app);

  httpServer.listen(0, () => {
    port = (httpServer.address() as any).port;
    ioServer = new Server(httpServer);
    io.attach(httpServer);
    done();
  });
});

afterAll((done) => {
  io.close();
  httpServer.close((err) => {
    if (err) {
      console.error("Error closing server: ", err);
    }
    done();
  });
});

describe("Express HTTP routes", () => {
  beforeEach((done) => {
    const currentTest = expect.getState().currentTestName;

    clientSocket = Client(`http://localhost:${port}`, {
      query: { room: "test-room", player: "test-player" },
    });
    clientSocket.on("connect", done);
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
      clientSocket.close();
    }
  });

  test("App-connection-wrong-path-status-404", async () => {
    const res = await request(app).get(`/`);
    expect(res.status).toBe(404);
  });

  test("App-connection-wrong-param", async () => {
    const clientSocket = Client(`http://localhost:${port}`, {
      query: { room: 123, player: null },
    });

    clientSocket.on("redirect", (url) => {
      expect(url).toBe("/error");
    });

    clientSocket.on("disconnect", () => {
      expect(clientSocket.connected).toBe(false);
      clientSocket.close();
    });
  });

  test("App-connection-Good-path-and-unique-user-status-200", async () => {
    const res = await request(app).get("/room/port");
    expect(res.status).toBe(200);
  });

  test("App-connection-red-tetris-logo", async () => {
    const res = await request(app).get("/redtetris.ico");
    expect(res.status).toBe(200);
  });

  test("App-connection-user-not-unique-status-400", async () => {
    await request(app).get("/test-room/test-player");

    const res = await request(app).get("/test-room/test-player");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Player name is not unique.");
  });
});

describe("Socket.io events", () => {
  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      query: { room: "test-room", player: "test-player" },
    });
    clientSocket.on("connect", done);
  });
  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
      clientSocket.close();
    }
  });
  test("App-leaderClick-event-leaderStartGame", (done) => {
    const roomSpy = jest.spyOn(Room.prototype, "leaderStartGame");

    clientSocket.on("gameStarted", () => {
      const room = findRoom(clientSocket.id);
      expect(room.leaderStartGame).toHaveBeenCalled();
      done();
    });
    clientSocket.emit("leaderClick", { speed: 1 });
  });

  test("App-Keboard-event-move-left", (done) => {
    const player = findPlayer(clientSocket.id);
    player.isPlaying = true;
    const moveSideSpy = jest.spyOn(Board.prototype, "moveSide");

    clientSocket.emit("keyboard", { type: "down", key: "ArrowLeft" });

    setTimeout(() => {
      try {
        expect(moveSideSpy).toHaveBeenCalledWith("left");
        done();
      } catch (error) {
        done(error);
      }
    }, 50);
  });

  test("App-Keboard-event-move-right", (done) => {
    const player = findPlayer(clientSocket.id);
    player.isPlaying = true;
    const moveSideSpy = jest.spyOn(Board.prototype, "moveSide");

    clientSocket.emit("keyboard", { type: "down", key: "ArrowRight" });

    setTimeout(() => {
      try {
        expect(moveSideSpy).toHaveBeenCalledWith("right");
        done();
      } catch (error) {
        done(error);
      }
    }, 50);
  });

  test("App-Keboard-event-arrow-up", (done) => {
    const player = findPlayer(clientSocket.id);
    player.isPlaying = true;
    const moveSideSpy = jest.spyOn(Board.prototype, "rotatePiece");

    clientSocket.emit("keyboard", { type: "down", key: "ArrowUp" });

    setTimeout(() => {
      try {
        expect(moveSideSpy).toHaveBeenCalled();
        done();
      } catch (error) {
        done(error);
      }
    }, 50);
  });

  test("App-Disconnection-clean-up-rooms", (done) => {
    const roomSpy = jest.spyOn(Room.prototype, "playerDisconnect");
    clientSocket.disconnect();

    setTimeout(() => {
      expect(roomSpy).toHaveBeenCalledWith("test-player");
      done();
    }, 100);
  });
});

describe("Room and Player management", () => {
  beforeEach((done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      query: { room: "test-room", player: "test-player" },
    });
    clientSocket.on("connect", done);
  });
  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
      clientSocket.close();
    }
  });
  test("App-is-good-Query-param", () => {
    const query = {
      room: "test-room",
      player: "test-player",
    };
    const result = isQueryParams(query);

    expect(result).toBe(true);
  });

  test("App-find-room-by-socketID", () => {
    const room = findRoom(clientSocket.id);
    expect(room).not.toBeNull();
  });

  test("App-find-player-by-socketID", () => {
    const player = findPlayer(clientSocket.id);
    expect(player).not.toBeNull();
  });

  test("App-User-uniqueness", () => {
    let result = checkUserUnique("test-player", "test-room");
    expect(result).toBe(false);
    result = checkUserUnique("test-player2", "test-rooom");
    expect(result).toBe(true);
  });
});
