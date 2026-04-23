import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUser } from "@/lib/calc";
import type { Region } from "@/types";

const AREAS: { name: string; regions: Region[] }[] = [
  { name: "北区", regions: ["北一区", "北二区", "北三区"] },
  { name: "西区", regions: ["西一区", "西二区"] },
  { name: "东区", regions: ["东一区一组", "东一区二组", "东二区", "东三区", "东四区"] },
  { name: "南区", regions: ["南一区广州区域", "南一区深圳区域", "南二区"] },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "region" | "admin">("choose");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  function goRegion(region: Region) {
    setUser({ region, role: "region" });
    navigate("/form");
  }

  function goAdmin() {
    if (adminPassword === "jinbo2026") {
      setUser({ region: "北一区", role: "admin" });
      navigate("/admin");
    } else {
      setError("密码错误");
    }
  }

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-slate-800">机构内容同盟计划</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">数据回收系统</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => setMode("region")}>
              我是区域销售，开始填表
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => setMode("admin")}>
              我是品牌战略部，进入后台
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader><CardTitle className="text-lg">总部后台登录</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">管理密码</label>
              <Input type="password" placeholder="请输入密码" value={adminPassword}
                onChange={(e) => { setAdminPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && goAdmin()} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMode("choose")}>返回</Button>
              <Button className="flex-1 bg-green-700 hover:bg-green-800" onClick={goAdmin}>登录</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">选择您所属的区域</CardTitle>
            <p className="text-sm text-muted-foreground">选择后将进入对应区域的数据录入页面</p>
          </CardHeader>
          <CardContent className="space-y-5 pb-6">
            {AREAS.map((area) => (
              <div key={area.name}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">{area.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {area.regions.map((r) => (
                    <button key={r} onClick={() => goRegion(r)}
                      className="p-3 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 font-medium transition-all text-center">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setMode("choose")}>返回</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
