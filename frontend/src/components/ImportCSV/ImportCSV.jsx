import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

function ImportCSV({ onCsvAdded }) {
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const resetModal = () => {
    setFile(null);
    setPreview(null);
    setIsPreviewing(false);
    setIsImporting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen) => {
    if (isPreviewing || isImporting) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      resetModal();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(null);
  };

  const handlePreview = async () => {
    if (!file || isPreviewing) return;

    setIsPreviewing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/trades/import/preview`,
        formData,
        {
          withCredentials: true,
        },
      );

      setPreview(response.data);
      toast.success("CSV processed successfully");
    } catch (error) {
      console.error(error.response?.data || error);

      toast.error(error.response?.data?.message || "Unable to preview CSV");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!preview || isImporting) return;

    const validRows = preview.rows
      .filter((item) => item.valid)
      .map((item) => item.data);

    if (validRows.length === 0) {
      toast.error("No valid trades to import");
      return;
    }

    setIsImporting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/trades/import`,
        {
          rows: validRows,
        },
        {
          withCredentials: true,
        },
      );

      toast.success(
        `${response.data.importedCount} trades imported successfully`,
      );

      setOpen(false);
      resetModal();

      await onCsvAdded?.();
    } catch (error) {
      console.error(error.response?.data || error);

      toast.error(error.response?.data?.message || "Failed to import trades");
    } finally {
      setIsImporting(false);
    }
  };

  const previewRows = preview?.preview ?? [];
  const validCount = previewRows.filter((row) => row.valid).length;
  const invalidCount = previewRows.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <div className="rounded-lg px-4! py-2.5! text-sm font-semibold border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 flex gap-1">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </div>
      </DialogTrigger>

      <DialogContent
        data-lenis-prevent
        className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-white scrollbar-none sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Import Trades</DialogTitle>

          <DialogDescription className="text-zinc-400">
            Upload your trading history, review the rows, and import them into
            your journal.
          </DialogDescription>
        </DialogHeader>

        {/* Upload section */}
        <section className="space-y-4">
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/40 p-6 text-center">
            <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-emerald-400" />

            <h3 className="font-medium">
              {file ? file.name : "Choose your CSV file"}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              CSV format · Maximum 5 MB
            </p>

            <input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              disabled={isPreviewing || isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            >
              {file ? "Choose another file" : "Browse files"}
            </Button>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-400" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>

                  <p className="text-xs text-zinc-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={isPreviewing || isImporting}
                onClick={() => {
                  setFile(null);
                  setPreview(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            type="button"
            onClick={handlePreview}
            disabled={!file || isPreviewing || isImporting}
            className="w-full bg-emerald-500 font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            {isPreviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing CSV...
              </>
            ) : (
              "Preview CSV"
            )}
          </Button>
        </section>

        {/* Preview section */}
        {preview && (
          <section className="space-y-4 border-t border-zinc-800 pt-5">
            <div>
              <h3 className="font-semibold">Import Preview</h3>

              <p className="mt-1 text-sm text-zinc-400">
                Review the validation results before importing.
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-400">Total rows</p>
                <p className="mt-1 text-xl font-semibold">
                  {preview.totalRows}
                </p>
              </div>

              <div className="rounded-lg border border-emerald-900/70 bg-emerald-950/30 p-3">
                <p className="text-xs text-emerald-400">Valid</p>
                <p className="mt-1 text-xl font-semibold text-emerald-400">
                  {validCount}
                </p>
              </div>

              <div className="rounded-lg border border-red-900/70 bg-red-950/30 p-3">
                <p className="text-xs text-red-400">Invalid</p>
                <p className="mt-1 text-xl font-semibold text-red-400">
                  {invalidCount}
                </p>
              </div>
            </div>

            {preview.totalRows > previewRows.length && (
              <div className="flex gap-2 rounded-lg border border-amber-800/70 bg-amber-950/30 p-3 text-sm text-amber-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  Only the first {previewRows.length} rows are shown and
                  available to import in this version. Your file contains{" "}
                  {preview.totalRows} rows.
                </p>
              </div>
            )}

            {/* Table */}
            <div className="max-h-72 overflow-auto rounded-lg border border-zinc-800">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="sticky top-0 bg-zinc-800 text-zinc-300">
                  <tr>
                    <th className="p-3">Row</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Side</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">P&L</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {previewRows.map((item) => (
                    <React.Fragment key={item.rowNumber}>
                      <tr className="border-t border-zinc-800">
                        <td className="p-3 text-zinc-400">{item.rowNumber}</td>

                        <td className="p-3 font-medium">{item.data.symbol}</td>

                        <td className="p-3">{item.data.side}</td>

                        <td className="p-3">{item.data.quantity}</td>

                        <td className="p-3">{item.data.pnl ?? "—"}</td>

                        <td className="p-3">
                          {item.valid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <AlertCircle className="h-4 w-4" />
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>

                      {!item.valid && (
                        <tr className="border-t border-zinc-800 bg-red-950/20">
                          <td
                            colSpan={6}
                            className="px-3 pb-3 text-xs text-red-300"
                          >
                            {item.errors.join(", ")}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-zinc-500">
              P&L is calculated by the backend during import. The table displays
              P&L from the CSV if provided.
            </p>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                onClick={() => {
                  setPreview(null);
                }}
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={validCount === 0 || isImporting || isPreviewing}
                onClick={handleImport}
                className="bg-emerald-500 font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${validCount} trades`
                )}
              </Button>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ImportCSV;
