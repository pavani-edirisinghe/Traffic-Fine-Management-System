import { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, MenuItem,
  Select, FormControl, InputLabel, Chip, Divider, Stack
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { mockFines } from '../data/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#0097a7', '#f57f17', '#37474f'];

const ALL_DISTRICTS = [...new Set(mockFines.map(f => f.district))].sort();
const ALL_CATEGORIES = [...new Set(mockFines.map(f => f.categoryName))].sort();

// Derive month options from data
const ALL_MONTHS = [...new Set(
  mockFines.map(f => f.dateIssued.slice(0, 7)) // "YYYY-MM"
)].sort();

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#1e293b', color: '#f8fafc', p: 1.5, borderRadius: 1, fontSize: 13 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color }}>
            {p.name}: Rs. {p.value?.toLocaleString()}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = 'text.primary' }) {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
        <Typography variant="h5" color={color} sx={{ fontWeight: 'bold' }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ── Filtered dataset ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return mockFines.filter(fine => {
      if (districtFilter !== 'ALL' && fine.district !== districtFilter) return false;
      if (categoryFilter !== 'ALL' && fine.categoryName !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && fine.status !== statusFilter) return false;
      if (monthFilter !== 'ALL' && !fine.dateIssued.startsWith(monthFilter)) return false;
      return true;
    });
  }, [districtFilter, categoryFilter, monthFilter, statusFilter]);

  // ── KPI Metrics ─────────────────────────────────────────────────────────────
  const totalIssued = filtered.length;
  const totalRevenue = filtered.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0);
  const pendingRevenue = filtered.filter(f => f.status === 'PENDING').reduce((s, f) => s + f.amount, 0);
  const collectionRate = totalIssued
    ? Math.round((filtered.filter(f => f.status === 'PAID').length / totalIssued) * 100)
    : 0;

  // ── District Revenue Bar Chart ───────────────────────────────────────────────
  const districtData = useMemo(() => {
    const map = {};
    filtered.forEach(fine => {
      if (!map[fine.district]) map[fine.district] = { name: fine.district, Collected: 0, Pending: 0 };
      if (fine.status === 'PAID') map[fine.district].Collected += fine.amount;
      else map[fine.district].Pending += fine.amount;
    });
    return Object.values(map).sort((a, b) => b.Collected - a.Collected);
  }, [filtered]);

  // ── Category Pie Chart ───────────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map = {};
    filtered.forEach(fine => {
      if (!map[fine.categoryName]) map[fine.categoryName] = { name: fine.categoryName, count: 0 };
      map[fine.categoryName].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filtered]);

  // ── Monthly Trend Line Chart ─────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const map = {};
    mockFines.forEach(fine => { // always show all months for trend context
      const month = fine.dateIssued.slice(0, 7);
      if (!map[month]) map[month] = { month, Revenue: 0, Fines: 0 };
      if (fine.status === 'PAID') map[month].Revenue += fine.amount;
      map[month].Fines += 1;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  // ── Top Category by Revenue ──────────────────────────────────────────────────
  const topCategory = useMemo(() => {
    const map = {};
    filtered.filter(f => f.status === 'PAID').forEach(f => {
      if (!map[f.categoryName]) map[f.categoryName] = 0;
      map[f.categoryName] += f.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : '—';
  }, [filtered]);

  const isFiltered = districtFilter !== 'ALL' || categoryFilter !== 'ALL' || monthFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Analytics</Typography>
        {isFiltered && (
          <Chip
            label="Filters active"
            color="primary"
            size="small"
            onDelete={() => {
              setDistrictFilter('ALL');
              setCategoryFilter('ALL');
              setMonthFilter('ALL');
              setStatusFilter('ALL');
            }}
            deleteIcon={<span style={{ fontSize: 14, paddingRight: 4 }}>✕</span>}
          />
        )}
      </Box>

      {/* ── Filters ── */}
      <Card elevation={1} sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Filter Data
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>District</InputLabel>
            <Select value={districtFilter} label="District" onChange={e => setDistrictFilter(e.target.value)}>
              <MenuItem value="ALL">All Districts</MenuItem>
              {ALL_DISTRICTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)}>
              <MenuItem value="ALL">All Categories</MenuItem>
              {ALL_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Month</InputLabel>
            <Select value={monthFilter} label="Month" onChange={e => setMonthFilter(e.target.value)}>
              <MenuItem value="ALL">All Months</MenuItem>
              {ALL_MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <KpiCard label="Total Fines (Filtered)" value={totalIssued} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            label="Revenue Collected"
            value={`Rs. ${totalRevenue.toLocaleString()}`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            label="Pending Amount"
            value={`Rs. ${pendingRevenue.toLocaleString()}`}
            color="error.main"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            label="Collection Rate"
            value={`${collectionRate}%`}
            sub={`Top category: ${topCategory}`}
            color={collectionRate >= 70 ? 'success.main' : 'warning.main'}
          />
        </Grid>
      </Grid>

      {/* ── Charts Row 1 ── */}
      <Grid container spacing={3}>
        {/* District Revenue Stacked Bar */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ p: 2, height: 370 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>District-Wise Collection</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={districtData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Legend />
                <Bar dataKey="Collected" stackId="a" fill="#1976d2" radius={[0, 0, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Pending" stackId="a" fill="#ef9a9a" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Category Pie */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ p: 2, height: 370, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>Fine Categories</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="45%"
                    innerRadius="40%" outerRadius="70%"
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} fines`, name]} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Charts Row 2: Monthly Trend ── */}
      <Card elevation={2} sx={{ p: 2, height: 320 }}>
        <Typography variant="h6" align="center" sx={{ mb: 1 }}>Monthly Revenue Trend</Typography>
        <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mb: 2 }}>
          Showing all months — unaffected by filters above
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip content={<RevenueTooltip />} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="Fines" stroke="#ed6c02" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Category Revenue Breakdown Table ── */}
      <Card elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Category Revenue Breakdown</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                {['Category', 'Total Fines', 'Paid', 'Pending', 'Revenue (LKR)', 'Collection Rate'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_CATEGORIES.map((cat, i) => {
                const rows = filtered.filter(f => f.categoryName === cat);
                const paid = rows.filter(f => f.status === 'PAID');
                const pending = rows.filter(f => f.status === 'PENDING');
                const revenue = paid.reduce((s, f) => s + f.amount, 0);
                const rate = rows.length ? Math.round((paid.length / rows.length) * 100) : 0;
                if (rows.length === 0) return null;
                return (
                  <tr key={cat} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{cat}</td>
                    <td style={{ padding: '10px 14px' }}>{rows.length}</td>
                    <td style={{ padding: '10px 14px', color: '#2e7d32' }}>{paid.length}</td>
                    <td style={{ padding: '10px 14px', color: '#d32f2f' }}>{pending.length}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Rs. {revenue.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ width: `${rate}%`, height: '100%', bgcolor: rate >= 70 ? '#2e7d32' : '#ed6c02', borderRadius: 3 }} />
                        </Box>
                        <Typography variant="caption">{rate}%</Typography>
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Card>

    </Box>
  );
}
