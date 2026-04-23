import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Entry, Region } from "@/types";
import { getUser, clearUser } from "@/lib/calc";
import { trpc } from "@/providers/trpc";
import EntryDialog from "@/components/EntryDialog";
import { LogOut, Plus, Pencil, Trash2, Search, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "已通过": "bg-green-100 text-green-800",
  "待审核": "bg-yellow-100 text-yellow-800",
  "未通过": "bg-red-100 text-red-800",
};
const TIER_COLORS: Record<string, string> = {
  "高阶": "bg-green-100 text-green-800",
  "进阶": "bg-yellow-100 text-yellow-800",
  "基础": "bg-blue-100 text-blue-800",
};

export default function FormPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");

  if (!user || user.role !== "region") {
    return <div className="min-h-screen flex items-center justify-center"><Card className="w-96 text-center p-6"><p className="text-muted-foreground mb-4">请先选择区域</p><Button onClick={() => navigate("/")}>去登录</Button></Card></div>;
  }

  const region = user.region as Region;
  const utils = trpc.useUtils();
  const { data: allEntries = [] } = trpc.entry.list.useQuery({ region });
  const deleteMut = trpc.entry.delete.useMutation({ onSuccess: () => utils.entry.list.invalidate() });

  const entries = search.trim()
    ? allEntries.filter(e => e.orgName.toLowerCase().includes(search.toLowerCase()) || e.accountName.toLowerCase().includes(search.toLowerCase()) || e.city.toLowerCase().includes(search.toLowerCase()))
    : allEntries;

  const total = allEntries.length;
  const approved = allEntries.filter(e => e.approveStatus === "已通过").length;
  const totalNeedles = allEntries.reduce((s, e) => s + (e.rewardCount ?? 0), 0);

  function handleAdd() { setEditingEntry(null); setDialogOpen(true); }
  function handleEdit(e: Entry) { setEditingEntry(e); setDialogOpen(true); }
  function handleSaved() { utils.entry.list.invalidate(); }
  function handleDelete(id: number) { if (confirm("确定删除？")) deleteMut.mutate({ id }); }
  function handleLogout() { clearUser(); navigate("/"); }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">J</div>
            <div>
              <h1 className="text-base font-bold text-slate-800">内容回收系统</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">{region}</Badge>
                <span className="text-xs text-muted-foreground">销售端</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" />退出</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">已登记内容</p><p className="text-2xl font-bold text-slate-800">{total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">审核通过</p><p className="text-2xl font-bold text-green-600">{approved}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">累计样针</p><p className="text-2xl font-bold text-blue-600">{totalNeedles}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">均条样针</p><p className="text-2xl font-bold text-slate-600">{total > 0 ? (totalNeedles / total).toFixed(1) : "0"}</p></CardContent></Card>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜索机构、账号、城市..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1" />新增登记</Button>
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" />我的登记记录（仅本区域可见）</CardTitle></CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>暂无记录</p><p className="text-sm">点击「新增登记」开始录入</p></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead><TableHead>机构</TableHead><TableHead>平台</TableHead>
                      <TableHead>审核</TableHead><TableHead>互动</TableHead><TableHead>档位</TableHead>
                      <TableHead>样针</TableHead><TableHead className="w-20">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, idx) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                        <TableCell><p className="font-medium text-sm">{entry.orgName}</p><p className="text-xs text-muted-foreground">{entry.city} · {entry.accountName}</p></TableCell>
                        <TableCell className="text-sm">{entry.platform}</TableCell>
                        <TableCell><Badge variant="outline" className={STATUS_COLORS[entry.approveStatus] || ""}>{entry.approveStatus}</Badge></TableCell>
                        <TableCell className="text-sm font-medium">{entry.interactCount}</TableCell>
                        <TableCell>{entry.tier ? <Badge className={`${TIER_COLORS[entry.tier]} text-xs`}>{entry.tier}</Badge> : "-"}</TableCell>
                        <TableCell className="font-bold text-blue-600">{entry.rewardCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(entry as Entry)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(entry.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EntryDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingEntry(null); }} entry={editingEntry} region={region} onSaved={handleSaved} />
    </div>
  );
}
