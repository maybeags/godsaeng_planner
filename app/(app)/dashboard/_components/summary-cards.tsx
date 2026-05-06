import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportSummary } from "@/lib/stats";

export function SummaryCards({
  summary,
  rangeLabel,
}: {
  summary: ReportSummary;
  rangeLabel: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="bg-gradient-to-br from-primary/15 to-transparent">
        <CardHeader className="pb-2">
          <CardDescription>{rangeLabel} 성취율</CardDescription>
          <CardTitle className="text-3xl font-bold text-primary">
            {summary.rate}%
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          완료 {summary.done} · 전체 {summary.total}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>적은 플랜</CardDescription>
          <CardTitle className="text-3xl font-bold">{summary.total}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          한 줄씩 쌓이는 갓생
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>완료한 플랜</CardDescription>
          <CardTitle className="text-3xl font-bold">{summary.done}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {summary.total - summary.done > 0
            ? `남은 ${summary.total - summary.done}개도 화이팅`
            : "오늘도 클리어!"}
        </CardContent>
      </Card>
    </div>
  );
}
