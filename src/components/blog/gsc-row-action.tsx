"use client";

import { useState } from "react";
import { BarChart3, X } from "lucide-react";

type Row = {
  id: string;
  keyword: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export function GscRowAction({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setOpen(true);
    setLoading(true);
    const response = await fetch(`/api/admin/blog/gsc-details?slug=${encodeURIComponent(slug)}`);
    const payload = (await response.json().catch(() => ({}))) as { rows?: Row[] };
    setRows(payload.rows ?? []);
    setLoading(false);
  };

  return (
    <>
      <button type="button" onClick={() => void load()} className="inline-flex h-7 items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100">
        <BarChart3 size={13} />
        GSC详情
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-20 max-w-3xl rounded-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-bold text-slate-950">GSC 关键词详情</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-5">
              {loading ? <p className="text-sm text-slate-500">加载中...</p> : rows.length === 0 ? <p className="text-sm text-slate-500">暂无 GSC 关键词数据。</p> : (
                <table className="min-w-full text-left text-xs">
                  <thead className="text-slate-400"><tr><th className="py-2">关键词</th><th>日期</th><th>点击</th><th>展示</th><th>CTR</th><th>排名</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => <tr key={row.id}><td className="py-2 font-semibold text-slate-800">{row.keyword}</td><td>{new Date(row.date).toLocaleDateString("zh-CN")}</td><td>{row.clicks}</td><td>{row.impressions}</td><td>{(row.ctr * 100).toFixed(2)}%</td><td>{row.position.toFixed(1)}</td></tr>)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
