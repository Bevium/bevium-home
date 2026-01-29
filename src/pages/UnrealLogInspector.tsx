import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

import { useUnrealLogParser } from "@/components/tools/unreal-log-inspector/useUnrealLogParser";
import { LogLoader } from "@/components/tools/unreal-log-inspector/LogLoader";
import { FiltersPanel } from "@/components/tools/unreal-log-inspector/FiltersPanel";
import { ResultsPane } from "@/components/tools/unreal-log-inspector/ResultsPane";
import { FiltersToolbar } from "@/components/tools/unreal-log-inspector/FiltersToolbar";
import ToolsPageNavBar from "@/components/ToolsPageNavBar";

export default function UnrealLogInspector() {
  const log = useUnrealLogParser();

  const total = log.entries.length;
  const shown = log.filteredIndexes.length;
  const hasParsed = total > 0;

  const [inputOpen, setInputOpen] = useState(!hasParsed);

  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    if (hasParsed) {
      setInputOpen(false);
      setAdvancedOpen(false);
    }
  }, [hasParsed]);

  return (
    <>
      <ToolsPageNavBar />
      <section className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-4">
                  <FileSearch className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Tools / Unreal Engine</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold">
                  <span className="text-gradient">Log Inspector</span>
                </h1>

                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Upload or paste Unreal logs. Auto-extract categories & verbosity. Filter, search and slice by date.
                </p>

                {hasParsed && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Parsed: <span className="text-foreground font-medium">{total}</span> • Showing:{" "}
                    <span className="text-foreground font-medium">{shown}</span>
                    {log.hasTimestamps ? " • Timestamps: yes" : " • Timestamps: none detected"}
                  </p>
                )}
              </div>

              <Button variant="outline" asChild className="gap-2">
                <Link to="/tools">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Tools
                </Link>
              </Button>
            </div>
          </div>

          {/* If no parsed log => show ONLY the loader */}
          {!hasParsed ? (
            <div className="w-full">
              <LogLoader
                rawText={log.rawText}
                parsing={log.parsing}
                onSetText={(t) => log.setText(t)}
                onParse={() => log.parseText(log.rawText)}
                onClear={log.clearAll}
                onUploadText={(t) => log.setText(t, { autoParse: true })}
              />
            </div>
          ) : (
            <>
              {/* Collapsible input section (FULL ROW when open) */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setInputOpen((v) => !v)}
                  >
                    {inputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Log Input (upload / paste)
                  </button>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setInputOpen(true)}>
                      Edit log
                    </Button>
                    <Button size="sm" variant="outline" onClick={log.clearAll}>
                      Clear log
                    </Button>
                  </div>
                </div>

                {inputOpen && (
                  <div className="mt-4">
                    <LogLoader
                      rawText={log.rawText}
                      parsing={log.parsing}
                      onSetText={(t) => log.setText(t)}
                      onParse={() => log.parseText(log.rawText)}
                      onClear={log.clearAll}
                      onUploadText={(t) => log.setText(t, { autoParse: true })}
                    />
                  </div>
                )}
              </div>

              {/* Filters toolbar (FULL WIDTH) */}
              <div className="mb-5">
                <FiltersToolbar
                  query={log.query}
                  setQuery={log.setQuery}
                  verbosities={log.verbosities}
                  activeVerb={log.activeVerb}
                  toggleVerb={log.toggleVerb}
                  setVerbAll={log.setVerbAll}
                  quickErrorsWarnings={log.quickErrorsWarnings}
                  hasTimestamps={log.hasTimestamps}
                  fromDate={log.fromDate}
                  toDate={log.toDate}
                  setFromDate={log.setFromDate}
                  setToDate={log.setToDate}
                  excludedCats={log.excludedCats}
                  unexcludeCategory={log.unexcludeCategory}
                  clearExcludedCats={log.clearExcludedCats}
                  shown={shown}
                  total={total}
                  advancedOpen={advancedOpen}
                  setAdvancedOpen={setAdvancedOpen}
                  clearAllFilters={log.clearAllFilters}
                />
              </div>

              {/* Advanced filters (collapsible, FULL WIDTH) */}
              {advancedOpen && (
                <div className="mb-6">
                  <FiltersPanel
                    hasTimestamps={log.hasTimestamps}
                    categories={log.categories}
                    verbosities={log.verbosities}
                    query={log.query}
                    setQuery={log.setQuery}
                    fromDate={log.fromDate}
                    toDate={log.toDate}
                    setFromDate={log.setFromDate}
                    setToDate={log.setToDate}
                    activeCats={log.activeCats}
                    activeVerb={log.activeVerb}
                    toggleCat={log.toggleCat}
                    toggleVerb={log.toggleVerb}
                    setCatsAll={log.setCatsAll}
                    setVerbAll={log.setVerbAll}
                    quickErrorsWarnings={log.quickErrorsWarnings}
                    excludedCats={log.excludedCats}
                    unexcludeCategory={log.unexcludeCategory}
                    clearExcludedCats={log.clearExcludedCats}
                  />
                </div>
              )}

              {/* Results (FULL WIDTH) */}
              <ResultsPane
                entries={log.entries}
                filteredIndexes={log.filteredIndexes}
                hasTimestamps={log.hasTimestamps}
                onExcludeCategory={(c) => log.excludeCategory(c)}

                navTargetPos={log.navTargetPos}
                navCurrent={log.navCurrent}
                navTotal={log.navTotal}
                navLabel={log.navLabel}
                navNext={log.navNext}
                navPrev={log.navPrev}
                navGoToLine={log.navGoToLine}
              />

            </>
          )}
        </div>
      </section>
    </>
  );
}
