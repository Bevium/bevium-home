import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, ArrowLeft } from "lucide-react";
import { useUnrealLogParser } from "@/components/tools/unreal-log-inspector/useUnrealLogParser";
import { LogLoader } from "@/components/tools/unreal-log-inspector/LogLoader";
import { FiltersPanel } from "@/components/tools/unreal-log-inspector/FiltersPanel";
import { ResultsPane } from "@/components/tools/unreal-log-inspector/ResultsPane";


export default function UnrealLogInspector() {
  const log = useUnrealLogParser();

  const total = log.entries.length;
  const shown = log.filteredIndexes.length;

  return (
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

              <p className="text-sm text-muted-foreground mt-2">
                Parsed: <span className="text-foreground font-medium">{total}</span> • Showing:{" "}
                <span className="text-foreground font-medium">{shown}</span>
                {log.hasTimestamps ? " • Timestamps: yes" : " • Timestamps: none detected"}
              </p>
            </div>

            <Button variant="outline" asChild className="gap-2">
              <Link to="/tools">
                <ArrowLeft className="w-4 h-4" />
                Back to Tools
              </Link>
            </Button>
          </div>
        </div>

        {/* Loader + Filters */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <LogLoader
            rawText={log.rawText}
            parsing={log.parsing}
            onSetText={(t) => log.setText(t)}
            onParse={() => log.parseText(log.rawText)}
            onClear={log.clearAll}
            onUploadText={(t) => log.setText(t, { autoParse: true })}
          />

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

        {/* Results */}
        <ResultsPane
          entries={log.entries}
          filteredIndexes={log.filteredIndexes}
          onExcludeCategory={(c) => log.excludeCategory(c)}
        />
      </div>
    </section>
  );
}
