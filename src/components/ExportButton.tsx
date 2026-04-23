import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Entry } from "@/types";

interface Props {
  entries: Entry[];
  region?: string;
}

export default function ExportButton({ entries, region }: Props) {
  function handleExport() {
    if (entries.length === 0) {
      alert("没有数据可导出");
      return;
    }

    const data = entries.map((e) => ({
      "区域": e.region,
      "记录日期": e.recordDate,
      "机构名称": e.orgName,
      "机构地址": e.orgAddress,
      "所在城市": e.city,
      "主平台": e.platform,
      "账号类型": e.accountType,
      "账号名称": e.accountName,
      "内容类型": e.contentType,
      "涉及产品": e.product,
      "发布日期": e.publishDate,
      "内容链接": e.contentLink,
      "审核状态": e.approveStatus,
      "审核日期": e.approveDate,
      "审核人": e.approver,
      "数据回收日期": e.dataCollectDate,
      "截图已上传": e.screenshotUploaded ? "是" : "否",
      "阅读量/播放量": e.readCount,
      "点赞数": e.likes,
      "收藏数": e.favorites,
      "评论数": e.comments,
      "互动量": e.interactCount,
      "达到档位": e.tier,
      "应发样针数": e.rewardCount,
      "发放状态": e.sendStatus,
      "发放日期": e.sendDate,
      "物流单号": e.trackingNo,
      "确认签收": e.received ? "是" : "否",
      "签收日期": e.receiveDate,
      "备注": e.note,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "数据明细");

    const colWidths = [
      { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 8 }, { wch: 14 },
      { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 25 },
    ];
    ws['!cols'] = colWidths;

    const filename = region
      ? `内容回收数据_${region}_${new Date().toISOString().split("T")[0]}.xlsx`
      : `内容回收数据_全部_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
      <Download className="w-4 h-4" />
      导出Excel
    </Button>
  );
}
