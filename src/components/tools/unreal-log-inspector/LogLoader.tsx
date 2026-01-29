import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Filter, Trash2 } from "lucide-react";

export function LogLoader(props: {
  rawText: string;
  parsing: boolean;
  onSetText: (text: string) => void;
  onParse: () => void;
  onClear: () => void;
  onUploadText: (text: string) => void; // should auto-parse in parent/hook
}) {
  const { rawText, parsing, onSetText, onParse, onClear, onUploadText } = props;

  const onUploadFile = async (file: File) => {
    const text = await file.text();
    onUploadText(text); // parent decides auto-parse
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Load Log
        </CardTitle>
        <CardDescription>
          Paste a log or upload a .log/.txt.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            type="file"
            accept=".log,.txt,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onUploadFile(f);
            }}
          />

          <Button onClick={onParse} disabled={!rawText.trim() || parsing} className="gap-2">
            <Filter className="w-4 h-4" />
            {parsing ? "Parsing..." : "Parse"}
          </Button>

          <Button variant="outline" onClick={onClear} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        <Textarea
          value={rawText}
          onChange={(e) => onSetText(e.target.value)}
          placeholder="Paste Unreal log text here..."
          className="min-h-[260px] font-mono text-xs"
        />
      </CardContent>
    </Card>
  );
}
