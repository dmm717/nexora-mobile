export const CAREER_GOAL_SENIORITY_OPTIONS = [
  { value: 'intern', label: 'Thực tập sinh (Intern)' },
  { value: 'entry', label: 'Mới đi làm (Entry-level)' },
  { value: 'junior', label: 'Nhân viên (Junior)' },
  { value: 'mid', label: 'Chuyên viên (Mid-level)' },
  { value: 'senior', label: 'Chuyên viên cao cấp (Senior)' },
  { value: 'lead', label: 'Trưởng nhóm (Lead)' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
  { value: 'manager', label: 'Quản lý (Manager)' },
  { value: 'director', label: 'Giám đốc (Director)' },
  { value: 'executive', label: 'Điều hành (Executive)' },
] as const;

export function formatSeniorityLabel(seniority?: string | null): string {
  if (!seniority) return 'Chưa cập nhật';
  const trimmed = seniority.trim().toLowerCase();
  const match = CAREER_GOAL_SENIORITY_OPTIONS.find((opt) => opt.value === trimmed);
  return match ? match.label : seniority;
}

export function formatDate(isoString?: string | null): string {
  if (!isoString) return 'Chưa cập nhật';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Chưa cập nhật';
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return 'Chưa cập nhật';
  }
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAvatarColor(str: string): string {
  const colors = [
    '#f87171',
    '#fb923c',
    '#fbbf24',
    '#a3e635',
    '#4ade80',
    '#34d399',
    '#2dd4bf',
    '#22d3ee',
    '#38bdf8',
    '#60a5fa',
    '#818cf8',
    '#a78bfa',
    '#c084fc',
    '#e879f9',
    '#f472b6',
    '#fb7185',
  ];
  let hash = 0;
  if (!str) return colors[0];
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return colors[hash % colors.length];
}

export function reconcileCareerGoals<
  TActive extends { id?: string } | null | undefined,
  TGoal extends { id: string; active?: boolean }
>(
  activeGoalFromProfile: TActive,
  allGoals: TGoal[]
): {
  activeGoal: TActive extends object ? TActive : null;
  otherGoals: TGoal[];
} {
  const activeGoal = (activeGoalFromProfile || null) as TActive extends object ? TActive : null;
  const activeGoalId = activeGoal?.id;

  const otherGoals = activeGoalId
    ? allGoals.filter((g) => g.id !== activeGoalId)
    : allGoals.filter((g) => !g.active);

  return { activeGoal, otherGoals };
}
