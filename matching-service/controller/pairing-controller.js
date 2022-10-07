import { ormPairMatches as _pairMatches } from "../model/match-orm.js";
import { ormRemoveMatchTimeout as _removeMatch } from "../model/match-orm.js";

export async function pairMatches(req, socket) {
  try {
    if (req.timeLeft > 0) {
      const updatedMatchId = await _pairMatches(req.matchEntryId);
      // console.log(`Updated match id: ${updatedMatchId}`);
      if (updatedMatchId) {
        console.log(`Found match for ${req.matchEntryId} successfully!`);
        socket.emit("pairingSuccess", updatedMatchId);
        return;
      } else {
        console.log("No match found yet");
        return;
      }
    } else {
      console.log("Pair not found within countdown.");
      const removedMatchId = await _removeMatch(req.matchEntryId);
      console.log(`Removed match: ${removedMatchId}`);
      socket.emit("pairingFailed");
      return;
    }
  } catch (err) {
    console.log("Database failure when pairing match!");
    return;
    // return res.status(500).json({message: 'Database failure when creating new match!'})
  }
}
