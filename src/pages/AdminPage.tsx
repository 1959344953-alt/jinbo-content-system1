import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { REGIONS, APPROVE_STATUSES } from "@/types";
import type { Entry } from "@/types";
import { getUser, clearUser } from "@/lib/calc";
import { trpc } from "@/providers/trpc";
import DetailDialog from "@/components/DetailDialog";
import ExportButton from "@/components/ExportButton";
import { LogOut, Search, CheckCircle, BarChart3, FileText, Package, TrendingUp, Eye, ClipboardCheck, ImageIcon } from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  if (!user || user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center"><Card className="w-96 text-center p-6"><p className="text-muted-foreground mb-4">需要管理员权限</p><Button onClick={() => navigate("/")}>去登录</Button></Card></div>;
  }

  const utils = trpc.useUtils();
  const { data: allEntries = [] } = trpc.entry.list.useQuery(undefined);
  const { data: stats } = trpc.entry.stats.useQuery();
  const approveMut = trpc.entry.approve.useMutation({ onSuccess: () => { utils.entry.list.invalidate(); utils.entry.stats.invalidate(); } });
  const sendMut = trpc.entry.send.useMutation({ onSuccess: () => { utils.entry.list.invalidate(); utils.entry.stats.invalidate(); } });
  const receiveMut = trpc.entry.receive.useMutation({ onSuccess: () => { utils.entry.list.invalidate(); utils.entry.stats.invalidate(); } });

  const filtered = useMemo(() => {
    let result = [...allEntries];
    if (regionFilter !== "all") result = result.filter(e => e.region === regionFilter);
    if (statusFilter !== "all") result = result.filter(e => e.approveStatus === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(e => e.orgName.toLowerCase().includes(s) || e.accountName.toLowerCase().includes(s) || e.region.includes(s));
    }
    return result.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }, [allEntries, regionFilter, statusFilter, search]);

  function handleViewDetail(entry: Entry) {
    // Need to cast because tRPC returns numbers as strings for serial types
    setSelectedEntry(entry as Entry);
    setDetailOpen(true);
  }

  function handleApprove(entry: Entry, status: "已通过" | "未通过") {
    approveMut.mutate({ id: entry.id, status });
  }

  function handleSend(entry: Entry, trackingNo: string) {
    sendMut.mutate({ id: entry.id, status: "已发放", trackingNo });
  }

  function handleReceive(entry: Entry, received: boolean) {
    receiveMut.mutate({ id: entry.id, received });
  }

  function handleLogout() { clearUser(); navigate("/"); }

  const s = stats;
  const approvalRate = s && s.totalEntries > 0 ? ((s.approvedCount / s.totalEntries) * 100).toFixed(1) : "0";
  const progressRate = s && s.totalNeedles > 0 ? ((s.sentNeedles / s.totalNeedles) * 100).toFixed(1) : "0";

  // Transform db entries to Entry type for export
  const exportEntries: Entry[] = allEntries.map((e: Record<string, unknown>) => ({
    id: e.id as number,
    region: e.region as string,
    recordDate: e.recordDate as string,
    orgName: e.orgName as string,
    orgAddress: e.orgAddress as string ?? "",
    city: e.city as string,
    platform: e.platform as string,
    accountType: e.accountType as string,
    accountName: e.accountName as string,
    contentType: e.contentType as string,
    product: e.product as string,
    publishDate: e.publishDate as string ?? "",
    contentLink: e.contentLink as string ?? "",
    approveStatus: e.approveStatus as string,
    approveDate: e.approveDate as string ?? "",
    approver: e.approver as string ?? "",
    dataCollectDate: e.dataCollectDate as string ?? "",
    screenshotUploaded: Boolean(e.screenshotUploaded),
    screenshotData: e.screenshotData as string ?? "",
    readCount: Number(e.readCount ?? 0),
    likes: Number(e.likes ?? 0),
    favorites: Number(e.favorites ?? 0),
    comments: Number(e.comments ?? 0),
    interactCount: Number(e.interactCount ?? 0),
    tier: (e.tier as string) ?? "",
    rewardCount: Number(e.rewardCount ?? 0),
    sendStatus: e.sendStatus as string,
    sendDate: e.sendDate as string ?? "",
    trackingNo: e.trackingNo as string ?? "",
    received: Boolean(e.received),
    receiveDate: e.receiveDate as string ?? "",
    note: e.note as string ?? "",
    createdAt: new Date(e.createdAt as string),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <div>
              <h1 className="text-base font-bold text-slate-800">总部管理后台</h1>
              <span className="text-xs text-muted-foreground">品牌战略部</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton entries={exportEntries} />
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />退出</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><FileText className="w-4 h-4 text-blue-600" /><p className="text-xs text-muted-foreground">总内容数</p></div>
            <p className="text-2xl font-bold">{s?.totalEntries ?? 0}</p>
            <p className="text-xs text-muted-foreground">目标 400-600 条</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-xs text-muted-foreground">审核通过率</p></div>
            <p className="text-2xl font-bold">{approvalRate}%</p>
            <p className="text-xs text-muted-foreground">{s?.approvedCount ?? 0} 条已通过</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-orange-600" /><p className="text-xs text-muted-foreground">样针消耗</p></div>
            <p className="text-2xl font-bold">{s?.totalNeedles ?? 0} / 1000</p>
            <Progress value={s ? (s.totalNeedles / 1000) * 100 : 0} className="h-2 mt-2" />
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-purple-600" /><p className="text-xs text-muted-foreground">发放进度</p></div>
            <p className="text-2xl font-bold">{progressRate}%</p>
            <p className="text-xs text-muted-foreground">{s?.sentNeedles ?? 0} / {s?.totalNeedles ?? 0} 已发</p>
          </CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">档位分布</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {(["高阶", "进阶", "基础"] as const).map(t => {
                const count = s?.tierCounts[t] ?? 0;
                const pct = s && s.totalEntries > 0 ? ((count / s.totalEntries) * 100).toFixed(1) : "0";
                return <div key={t}><div className="flex justify-between text-sm mb-1"><span className="font-medium">{t}</span><span className="text-muted-foreground">{count} 条 ({pct}%)</span></div><Progress value={parseFloat(pct)} className="h-2" /></div>;
              })}
            </div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">平台分布</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {(["小红书", "抖音", "视频号"] as const).map(p => {
                const count = s?.platformCounts[p] ?? 0;
                const pct = s && s.totalEntries > 0 ? ((count / s.totalEntries) * 100).toFixed(1) : "0";
                return <div key={p}><div className="flex justify-between text-sm mb-1"><span className="font-medium">{p}</span><span className="text-muted-foreground">{count} 条 ({pct}%)</span></div><Progress value={parseFloat(pct)} className="h-2" /></div>;
              })}
            </div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">区域 TOP5</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">
              {s && [...s.regionCounts].sort((a, b) => b.count - a.count).slice(0, 5).map((rc, i) => (
                <div key={rc.region} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-200 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                    <span className="truncate max-w-[100px]">{rc.region}</span>
                  </div>
                  <span className="font-medium">{rc.count} 条</span>
                </div>
              ))}
            </div></CardContent></Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" />全部数据明细（点击查看完整内容）</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="搜索机构、账号..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="全部区域" /></SelectTrigger>
                <SelectContent>{[<SelectItem key="all" value="all">全部区域</SelectItem>, ...REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)]}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="全部状态" /></SelectTrigger>
                <SelectContent>{[<SelectItem key="all" value="all">全部状态</SelectItem>, ...APPROVE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)]}</SelectContent>
              </Select>
              <ExportButton entries={exportEntries} region={regionFilter !== "all" ? regionFilter : undefined} />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead><TableHead>区域</TableHead><TableHead>机构</TableHead>
                    <TableHead>平台</TableHead><TableHead>发布日期</TableHead><TableHead>审核</TableHead>
                    <TableHead>互动</TableHead><TableHead>档位</TableHead><TableHead>样针</TableHead>
                    <TableHead>截图</TableHead><TableHead>发放</TableHead><TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={12} className="text-center py-8 text-muted-foreground">暂无数据</TableCell></TableRow>
                  ) : (
                    filtered.map((entry, idx) => (
                      <TableRow key={entry.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleViewDetail(entry as Entry)}>
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{entry.region}</Badge></TableCell>
                        <TableCell><p className="text-sm font-medium">{entry.orgName}</p><p className="text-xs text-muted-foreground">{entry.city}</p></TableCell>
                        <TableCell className="text-sm">{entry.platform}</TableCell>
                        <TableCell className="text-sm">{entry.publishDate || "-"}</TableCell>
                        <TableCell><Badge variant="outline" className={entry.approveStatus === "已通过" ? "bg-green-100 text-green-800" : entry.approveStatus === "未通过" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>{entry.approveStatus}</Badge></TableCell>
                        <TableCell className="text-sm">{entry.interactCount}</TableCell>
                        <TableCell>{entry.tier && <Badge className={`text-xs ${entry.tier === "高阶" ? "bg-green-100 text-green-800" : entry.tier === "进阶" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{entry.tier}</Badge>}</TableCell>
                        <TableCell className="font-bold text-blue-600">{entry.rewardCount}</TableCell>
                        <TableCell>{entry.screenshotUploaded ? <ImageIcon className="w-4 h-4 text-green-600" /> : <span className="text-xs text-muted-foreground">-</span>}</TableCell>
                        <TableCell><Badge variant="outline" className={entry.sendStatus === "已发放" ? "bg-green-100 text-green-800" : entry.sendStatus === "已拒发" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"}>{entry.sendStatus}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant={entry.approveStatus === "待审核" ? "default" : "outline"} className={`h-7 text-xs ${entry.approveStatus === "待审核" ? "bg-yellow-500 hover:bg-yellow-600" : ""}`} onClick={e => { e.stopPropagation(); handleViewDetail(entry as Entry); }}>
                            {entry.approveStatus === "待审核" ? <><ClipboardCheck className="w-3 h-3 mr-1" />审核</> : <><Eye className="w-3 h-3 mr-1" />查看</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <DetailDialog open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedEntry(null); }}
        entry={selectedEntry} onApprove={handleApprove} onSend={handleSend} onReceive={handleReceive} />
    </div>
  );
}
