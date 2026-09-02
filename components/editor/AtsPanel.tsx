"use client";
import { useMemo, useState } from "react";
import { Drawer, Input, Progress, Tag } from "antd";
import { CheckCircleFilled, WarningFilled, CloseCircleFilled } from "@ant-design/icons";
import { useResumeStore } from "@/store/resumeStore";
import { runAtsChecks, keywordMatch, type AtsCheck, type CheckGroup, type CheckStatus } from "@/lib/atsCheck";

const STATUS_COLOR: Record<CheckStatus, string> = { pass: "#3f9142", warn: "#d9930b", fail: "#d64545" };
const scoreColor = (n: number) => (n >= 80 ? "#3f9142" : n >= 60 ? "#d9930b" : "#d64545");
const scoreLabel = (n: number) => (n >= 85 ? "Excellent" : n >= 70 ? "Strong" : n >= 55 ? "Needs work" : "At risk");
const GROUPS: CheckGroup[] = ["Structure", "Content", "Format"];

function StatusIcon({ status }: { status: CheckStatus }) {
  const c = STATUS_COLOR[status];
  if (status === "pass") return <CheckCircleFilled style={{ color: c }} />;
  if (status === "warn") return <WarningFilled style={{ color: c }} />;
  return <CloseCircleFilled style={{ color: c }} />;
}

function CheckRow({ check }: { check: AtsCheck }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: "1px solid #f0f0f2" }}>
      <span style={{ fontSize: 15, lineHeight: "18px", marginTop: 1 }}>
        <StatusIcon status={check.status} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2024" }}>{check.label}</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginTop: 1 }}>{check.detail}</div>
      </div>
    </div>
  );
}

export default function AtsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, theme, previewPages } = useResumeStore();
  const [jd, setJd] = useState("");

  const report = useMemo(() => (data ? runAtsChecks(data, theme, previewPages) : null), [data, theme, previewPages]);
  const km = useMemo(() => (data && jd.trim() ? keywordMatch(jd, data) : null), [data, jd]);

  return (
    <Drawer title="ATS check" open={open} onClose={onClose} size="default">
      {report && (
        <>
          {/* Score */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
            <Progress
              type="circle"
              percent={report.score}
              size={78}
              strokeColor={scoreColor(report.score)}
              format={(p) => <span style={{ fontSize: 20, fontWeight: 700, color: "#1f2024" }}>{p}</span>}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(report.score) }}>{scoreLabel(report.score)}</div>
              <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4, display: "flex", gap: 12 }}>
                <span><CheckCircleFilled style={{ color: STATUS_COLOR.pass }} /> {report.counts.pass}</span>
                <span><WarningFilled style={{ color: STATUS_COLOR.warn }} /> {report.counts.warn}</span>
                <span><CloseCircleFilled style={{ color: STATUS_COLOR.fail }} /> {report.counts.fail}</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9aa1ad", margin: "10px 0 18px", lineHeight: 1.5 }}>
            Heuristic checks against your resume’s content and layout. Fix the flagged items to improve parseability.
          </p>

          {/* Grouped checks */}
          {GROUPS.map((g) => {
            const rows = report.checks.filter((c) => c.group === g);
            if (!rows.length) return null;
            return (
              <div key={g} style={{ marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{g}</div>
                {rows.map((c) => <CheckRow key={c.id} check={c} />)}
              </div>
            );
          })}

          {/* Job-description keyword match */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>Job match</div>
          <Input.TextArea
            rows={5}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste a job description to see how many of its keywords your resume covers."
          />
          {km && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2024" }}>Keyword coverage</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(km.coverage) }}>{km.coverage}%</span>
              </div>
              <Progress percent={km.coverage} showInfo={false} strokeColor={scoreColor(km.coverage)} />
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                {km.matched.length} of {km.total} top keywords found.
              </div>
              {km.missing.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Missing — weave these in where truthful:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {km.missing.map((w) => <Tag key={w} style={{ margin: 0, fontSize: 12 }}>{w}</Tag>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
