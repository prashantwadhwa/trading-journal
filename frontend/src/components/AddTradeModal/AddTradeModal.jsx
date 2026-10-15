import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

function AddTradeModal({ onTradeAdded }) {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [openedAt, setOpenedAt] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [strategyTag, setStrategyTag] = useState("");
  const [emotionTag, setEmotionTag] = useState("");
  const [charges, setCharges] = useState("");
  const [notes, setNotes] = useState("");

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pnl = useMemo(() => {
    const qty = Number(quantity);
    const entry = Number(entryPrice);
    const exit = Number(exitPrice);
    const fee = Number(charges || 0);

    if (
      !quantity ||
      !entryPrice ||
      !exitPrice ||
      qty <= 0 ||
      entry <= 0 ||
      exit <= 0
    ) {
      return null;
    }

    const gross = (side === "BUY" ? exit - entry : entry - exit) * qty;

    return gross - fee;
  }, [side, quantity, entryPrice, exitPrice, charges]);

  const riskReward = useMemo(() => {
    const entry = Number(entryPrice);
    const sl = Number(stopLoss);
    const target = Number(targetPrice);

    if (!entryPrice || !stopLoss || !targetPrice || entry <= 0) {
      return null;
    }

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(target - entry);

    if (risk === 0) return null;

    return reward / risk;
  }, [entryPrice, stopLoss, targetPrice]);

  const resetForm = () => {
    setSymbol("");
    setSide("BUY");
    setQuantity("");
    setEntryPrice("");
    setExitPrice("");
    setStopLoss("");
    setTargetPrice("");
    setStrategyTag("");
    setEmotionTag("");
    setNotes("");
    setOpenedAt("");
    setClosedAt("");
  };

  const addTrade = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/trades/`,
        {
          symbol,
          side,
          quantity,
          entryPrice,
          exitPrice,
          stopLoss,
          targetPrice,
          strategyTag,
          emotionTag,
          notes,
          openedAt,
          closedAt,
        },
        {
          withCredentials: true,
        },
      );

      return true;
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error("Something went wrong");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const success = await addTrade();

      if (success) {
        toast.success("Trade added successfully");
        setOpen(false);
        resetForm();
        await onTradeAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} data-lenis-prevent>
      <DialogTrigger className="rounded-lg bg-emerald-500 px-4! py-2! text-sm font-semibold text-zinc-950 hover:bg-emerald-400">
        + Add Trade
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] scrollbar-none overflow-y-auto border-zinc-800 bg-zinc-900 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Trade</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Record your position and review its performance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400">
              Trade Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
                <Input
                  id="symbol"
                  name="symbol"
                  placeholder="e.g. INFY"
                  className="border-zinc-700 bg-zinc-800"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="side">Direction</FieldLabel>
                <Select value={side} onValueChange={setSide}>
                  <SelectTrigger
                    id="side"
                    className="w-full border-zinc-700 bg-zinc-800"
                  >
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Long / Buy</SelectItem>
                    <SelectItem value="SELL">Short / Sell</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="side" value={side} />
              </Field>

              <Field>
                <FieldLabel htmlFor="openedAt">Opened At</FieldLabel>
                <Input
                  id="openedAt"
                  name="openedAt"
                  type="datetime-local"
                  className="border-zinc-700 bg-zinc-800"
                  value={openedAt}
                  onChange={(e) => setOpenedAt(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="closedAt">Closed At</FieldLabel>
                <Input
                  id="closedAt"
                  name="closedAt"
                  type="datetime-local"
                  className="border-zinc-700 bg-zinc-800"
                  value={closedAt}
                  onChange={(e) => setClosedAt(e.target.value)}
                  required
                />
              </Field>
            </div>
          </section>

          {/* Entry and exit */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400">
              Prices & Position
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="entryPrice">Entry Price</FieldLabel>
                <Input
                  id="entryPrice"
                  name="entryPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="1203.00"
                  className="border-zinc-700 bg-zinc-800"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="exitPrice">Exit Price</FieldLabel>
                <Input
                  id="exitPrice"
                  name="exitPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="1300.00"
                  className="border-zinc-700 bg-zinc-800"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="50"
                  className="border-zinc-700 bg-zinc-800"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="charges">Charges</FieldLabel>
                <Input
                  id="charges"
                  name="charges"
                  type="number"
                  step="any"
                  min="0"
                  value={charges}
                  onChange={(e) => setCharges(e.target.value)}
                  placeholder="0.00"
                  className="border-zinc-700 bg-zinc-800"
                />
              </Field>
            </div>
          </section>

          {/* Risk management */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400">
              Risk Management
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="stopLoss">Stop Loss</FieldLabel>
                <Input
                  id="stopLoss"
                  name="stopLoss"
                  type="number"
                  step="any"
                  min="0"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="1150.00"
                  className="border-zinc-700 bg-zinc-800"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="targetPrice">Target Price</FieldLabel>
                <Input
                  id="targetPrice"
                  name="targetPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="1500.00"
                  className="border-zinc-700 bg-zinc-800"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-3">
                <p className="text-xs text-zinc-400">Net P&L (preview)</p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    (pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {pnl === null
                    ? "—"
                    : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}`}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-3">
                <p className="text-xs text-zinc-400">
                  Risk / Reward (2R is usually preferred)
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {riskReward === null ? "—" : `${riskReward.toFixed(2)}R`}
                </p>
              </div>
            </div>
          </section>

          {/* Journal */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400">
              Trade Journal
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="strategyTag">Strategy</FieldLabel>
                <Input
                  id="strategyTag"
                  name="strategyTag"
                  placeholder="e.g. Breakout"
                  className="border-zinc-700 bg-zinc-800"
                  value={strategyTag}
                  onChange={(e) => setStrategyTag(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="emotionTag">Emotion</FieldLabel>
                <Select
                  name="emotionTag"
                  required
                  value={emotionTag}
                  onValueChange={setEmotionTag}
                >
                  <SelectTrigger
                    id="emotionTag"
                    className="w-full border-zinc-700 bg-zinc-800"
                  >
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIDENT">Confident</SelectItem>
                    <SelectItem value="CALM">Calm</SelectItem>
                    <SelectItem value="FOMO">FOMO</SelectItem>
                    <SelectItem value="BORED">BORED</SelectItem>
                    <SelectItem value="ANXIOUS">ANXIOUS</SelectItem>
                    <SelectItem value="REVENGE">REVENGE</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Why did you enter? What went well? What could improve?"
                className="min-h-24 resize-y border-zinc-700 bg-zinc-800"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </section>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Trade...
                </>
              ) : (
                "Save Trade"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTradeModal;
