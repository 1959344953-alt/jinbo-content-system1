import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Entry, Region } from "@/types";
import { PLATFORMS, ACCOUNT_TYPES, CONTENT_TYPES, PRODUCTS } from "@/types";
import { calcAutoFields } from "@/lib/calc";
import { Upload, X, ImageIcon } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface Props {
  open: boolean;
  onClose: () => void;
  entry?: Entry | null;
  region: Region;
  onSaved: () => void;
}

const emptyForm = {
  recordDate: new Date().toISOString().split("T")[0],
  orgName: "", orgAddress: "", city: "", platform: "小红书" as const,
  accountType: "机构官方" as const, accountName: "", contentType: "图文" as const,
  product: "极纯" as const, publishDate: "", contentLink: "",
  dataCollectDate: "", screenshotUploaded: false, screenshotData: "",
  readCount: 0, likes: 0, favorites: 0, comments: 0, note: "",
};

export default function EntryDialog({ open, onClose, entry, region, onSaved }: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  const [auto, setAuto] = useState({ interactCount: 0, tier: "" as Entry["tier"], rewardCount: 0 });
  const createMut = trpc.entry.create.useMutation({ onSuccess: () => { onSaved(); onClose(); } });
  const updateMut = trpc.entry.update.useMutation({ onSuccess: () => { onSaved(); onClose(); } });

  useEffect(() => {
    if (entry) {
      setForm({
        recordDate: entry.recordDate, orgName: entry.orgName, orgAddress: entry.orgAddress,
        city: entry.city, platform: entry.platform, accountType: entry.accountType,
        accountName: entry.accountName, contentType: entry.contentType, product: entry.product,
        publishDate: entry.publishDate, contentLink: entry.contentLink,
        dataCollectDate: entry.dataCollectDate, screenshotUploaded: entry.screenshotUploaded,
        screenshotData: entry.screenshotData, readCount: entry.readCount, likes: entry.likes,
        favorites: entry.favorites, comments: entry.comments, note: entry.note,
      });
      setAuto({ interactCount: entry.interactCount, tier: entry.tier, rewardCount: entry.rewardCount });
    } else {
      setForm({ ...emptyForm, recordDate: new Date().toISOString().split("T")[0] });
      setAuto({ interactCount: 0, tier: "", rewardCount: 0 });
    }
  }, [entry, open]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    recalc(next);
  }

  function recalc(current: typeof form) {
    setAuto(calcAutoFields({ likes: current.likes, favorites: current.favorites, comments: current.comments, readCount: current.readCount, platform: current.platform }));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("图片大小不能超过5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setForm(p => ({ ...p, screenshotData: data, screenshotUploaded: true }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.orgName.trim()) { alert("请填写机构名称"); return; }
    const payload = { ...form, region, ...auto };
    if (entry) {
      updateMut.mutate({ id: entry.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const tc = auto.tier === "高阶" ? "bg-green-100 text-green-800" : auto.tier === "进阶" ? "bg-yellow-100 text-yellow-800" : auto.tier === "基础" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{entry ? "编辑记录" : "新增内容登记"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">记录日期 *</Label><Input type="date" value={form.recordDate} onChange={e => update("recordDate", e.target.value)} /></div>
            <div><Label className="text-xs">机构名称 *</Label><Input placeholder="机构全称" value={form.orgName} onChange={e => update("orgName", e.target.value)} /></div>
            <div><Label className="text-xs">所在城市 *</Label><Input placeholder="如：北京" value={form.city} onChange={e => update("city", e.target.value)} /></div>
          </div>
          <div>
            <Label className="text-xs">机构地址</Label>
            <Input placeholder="机构详细地址（用于物流发货）" value={form.orgAddress} onChange={e => update("orgAddress", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">主平台 *</Label>
              <Select value={form.platform} onValueChange={v => update("platform", v as Entry["platform"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">账号类型 *</Label>
              <Select value={form.accountType} onValueChange={v => update("accountType", v as Entry["accountType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACCOUNT_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">账号名称 *</Label><Input placeholder="发布账号名称" value={form.accountName} onChange={e => update("accountName", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">内容类型 *</Label>
              <Select value={form.contentType} onValueChange={v => update("contentType", v as Entry["contentType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTENT_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">涉及产品 *</Label>
              <Select value={form.product} onValueChange={v => update("product", v as Entry["product"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">发布日期 *</Label><Input type="date" value={form.publishDate} onChange={e => update("publishDate", e.target.value)} /></div>
          </div>
          <div><Label className="text-xs">内容链接 *</Label><Input placeholder="https://..." value={form.contentLink} onChange={e => update("contentLink", e.target.value)} /></div>

          <div className="border-t pt-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">数据回收（发布后一周内）</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">数据回收日期</Label><Input type="date" value={form.dataCollectDate} onChange={e => update("dataCollectDate", e.target.value)} /></div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">数据截图上传（后台截图，须含完整数据界面）</Label>
            {!form.screenshotData ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">点击上传截图</p>
                <p className="text-[10px] text-slate-400">支持 JPG/PNG，最大5MB</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
              </label>
            ) : (
              <div className="relative w-full border rounded-lg overflow-hidden">
                <img src={form.screenshotData} alt="预览" className="w-full max-h-48 object-contain bg-slate-100" />
                <button onClick={() => setForm(p => ({ ...p, screenshotData: "", screenshotUploaded: false }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />已上传
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div><Label className="text-xs">阅读量/播放量</Label><Input type="number" min={0} value={form.readCount || ""} onChange={e => update("readCount", parseInt(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">点赞数</Label><Input type="number" min={0} value={form.likes || ""} onChange={e => update("likes", parseInt(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">收藏数</Label><Input type="number" min={0} value={form.favorites || ""} onChange={e => update("favorites", parseInt(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">评论数</Label><Input type="number" min={0} value={form.comments || ""} onChange={e => update("comments", parseInt(e.target.value) || 0)} /></div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border">
            <h4 className="text-xs font-bold text-slate-500 mb-2">自动计算结果（无需填写）</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xs text-muted-foreground">互动量</p><p className="text-xl font-bold text-slate-800">{auto.interactCount}</p></div>
              <div><p className="text-xs text-muted-foreground">达到档位</p><Badge variant="outline" className={`${tc} mt-1`}>{auto.tier || "-"}</Badge></div>
              <div><p className="text-xs text-muted-foreground">应发样针数</p><p className="text-xl font-bold text-blue-600">{auto.rewardCount}</p></div>
            </div>
          </div>

          <div><Label className="text-xs">备注</Label><Textarea placeholder="特殊情况说明..." value={form.note} onChange={e => update("note", e.target.value)} rows={2} /></div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>取消</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {entry ? "保存修改" : "提交登记"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
