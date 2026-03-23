import type { RoomStatus } from "@family-playground/types";

export function getRoomPath(roomId: string, status: RoomStatus) {
  return status === "playing" ? `/room/${roomId}/play` : `/room/${roomId}`;
}
