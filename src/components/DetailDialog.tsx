import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Entry } from "@/types";
import { CheckCircle, XCircle, ImageIcon, ExternalLink, Calendar, Building2, MapPin, User, Smartphone, FileText, Tag, BarChart3, Package, Truck, ClipboardCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  entry: Entry | null;
  onApprove: (entry: Entry, status: "已通过" | "未通过") => void;
  onSend: (entry: Entry, trackingNo: string) => void;
  onReceive: (entry: Entry, received: boolean) => void;
}

function FieldRow({ icon: Icon, label, value, isLink }: { icon: React.ElementType; label: string; value: string | number; isLink?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        {isLink && value ? (
          <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1">
            {String(value).slice(0, 60)}{String(value).length > 60 ? "..." : ""}<ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : <p className="text-sm font-medium text-slate-800">{value || "-"}</p>}
      </div>
    </div>
  );
}

export default function DetailDialog({ open, onClose, entry, onApprove, onSend, onReceive }: Props) {
  const [trackingNo, setTrackingNo] = useState("");
  if (!entry) return null;

  const isPending = entry.approveStatus === "待审核";
  const isApproved = entry.approveStatus === "已通过";
  const canSend = isApproved && entry.sendStatus === "待发放";

  const tierColor = entry.tier === "高阶" ? "bg-green-100 text-green-800" : entry.tier === "进阶" ? "bg-yellow-100 text-yellow-800" : entry.tier === "基础" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500";
  const approveColor = entry.approveStatus === "已通过" ? "bg-green-100 text-green-800" : entry.approveStatus === "未通过" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-blue-600" />内容明细与审核</DialogTitle>
        </DialogHeader>

        {/* Status banner */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 flex-wrap">
          <Badge variant="outline" className={`${approveColor} px-3 py-1`}>审核：{entry.approveStatus}</Badge>
          {entry.tier && <Badge variant="outline" className={`${tierColor} px-3 py-1`}>档位：{entry.tier}</Badge>}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 px-3 py-1">样针：{entry.rewardCount} 支</Badge>
          <Badge variant="outline" className={`${entry.sendStatus === "已发放" ? "bg-green-100 text-green-800" : entry.sendStatus === "已拒发" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"} px-3 py-1`}>
            发放：{entry.sendStatus}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Building2 className="w-3 h-3" /> 机构信息</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <FieldRow icon={Building2} label="机构名称" value={entry.orgName} />
              <FieldRow icon={MapPin} label="机构地址" value={entry.orgAddress} />
              <FieldRow icon={MapPin} label="所在城市" value={entry.city} />
              <FieldRow icon={Smartphone} label="主平台" value={entry.platform} />
              <FieldRow icon={User} label="区域" value={entry.region} />
              <FieldRow icon={User} label="账号类型" value={entry.accountType} />
              <FieldRow icon={User} label="账号名称" value={entry.accountName} />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> 内容信息</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <FieldRow icon={Calendar} label="记录日期" value={entry.recordDate} />
              <FieldRow icon={Calendar} label="发布日期" value={entry.publishDate} />
              <FieldRow icon={Tag} label="内容类型" value={entry.contentType} />
              <FieldRow icon={Tag} label="涉及产品" value={entry.product} />
              <FieldRow icon={ExternalLink} label="内容链接" value={entry.contentLink} isLink />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> 数据回收</h4>
            <div className="grid grid-cols-2 gap-x-4">
              <FieldRow icon={Calendar} label="数据回收日期" value={entry.dataCollectDate} />
              <FieldRow icon={ImageIcon} label="截图上传" value={entry.screenshotUploaded ? "已上传" : "未上传"} />
              <FieldRow icon={BarChart3} label="阅读量/播放量" value={entry.readCount.toLocaleString()} />
              <FieldRow icon={BarChart3} label="点赞数" value={entry.likes.toLocaleString()} />
              <FieldRow icon={BarChart3} label="收藏数" value={entry.favorites.toLocaleString()} />
              <FieldRow icon={BarChart3} label="评论数" value={entry.comments.toLocaleString()} />
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-[10px] text-blue-600">互动量</p><p className="text-lg font-bold text-blue-800">{entry.interactCount}</p></div>
                <div><p className="text-[10px] text-blue-600">达到档位</p><Badge className={`${tierColor} mt-1`}>{entry.tier || "-"}</Badge></div>
                <div><p className="text-[10px] text-blue-600">应发样针</p><p className="text-lg font-bold text-blue-800">{entry.rewardCount} 支</p></div>
              </div>
            </div>
          </div>

          {entry.screenshotData && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> 数据截图</h4>
              <div className="border rounded-lg overflow-hidden bg-white">
                <img src={entry.screenshotData} alt="截图" className="w-full max-h-80 object-contain cursor-pointer"
                  onClick={() => window.open(entry.screenshotData, "_blank")} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">点击图片查看大图</p>
            </div>
          )}

          {/* Tracking / Send section */}
          {(entry.sendStatus !== "待发放" || entry.trackingNo || entry.received) && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Truck className="w-3 h-3" /> 物流跟踪</h4>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldRow icon={Package} label="发放状态" value={entry.sendStatus} />
                <FieldRow icon={Calendar} label="发放日期" value={entry.sendDate} />
                <FieldRow icon={Truck} label="物流单号" value={entry.trackingNo} />
                <FieldRow icon={CheckCircle} label="确认签收" value={entry.received ? "已签收" : "未签收"} />
                <FieldRow icon={Calendar} label="签收日期" value={entry.receiveDate} />
              </div>
            </div>
          )}

          {entry.note && (
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">备注</h4>
              <p className="text-sm text-slate-700">{entry.note}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>关闭</Button>
          {isPending && (
            <>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => { onApprove(entry, "未通过"); onClose(); }}>
                <XCircle className="w-4 h-4 mr-1" />拒绝
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { onApprove(entry, "已通过"); onClose(); }}>
                <CheckCircle className="w-4 h-4 mr-1" />通过
              </Button>
            </>
          )}
          {canSend && (
            <div className="flex-1 flex gap-2 items-center">
              <Input placeholder="物流单号" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className="flex-1 text-sm" />
              <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap" onClick={() => { if (!trackingNo.trim()) { alert("请填写物流单号"); return; } onSend(entry, trackingNo); onClose(); }}>
                <Package className="w-4 h-4 mr-1" />确认发放
              </Button>
            </div>
          )}
          {entry.sendStatus === "已发放" && !entry.received && (
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => { onReceive(entry, true); onClose(); }}>
              <CheckCircle className="w-4 h-4 mr-1" />标记签收
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
