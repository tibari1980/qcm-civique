'use client';

import React from 'react';
import { Card } from '../../ui/card';
import { Target, Activity, TrendingUp, BookOpen } from 'lucide-react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip,
    BarChart, 
    Bar,
    Cell
} from 'recharts';

interface DashboardAnalyticsProps {
    scoreHistory: {name: string, score: number, theme: string}[];
    themeStats: {name: string, score: number, color: string}[];
}

export default function DashboardAnalytics({ scoreHistory, themeStats }: DashboardAnalyticsProps) {
    if (scoreHistory.length === 0 && themeStats.length === 0) return null;

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-3 border border-slate-200 shadow-xl rounded-xl">
                    <p className="font-bold text-slate-800">{label}</p>
                    <p className="text-sm font-black text-primary">Score : {payload[0].value}%</p>
                    {payload[0].payload.theme && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{payload[0].payload.theme}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* CHART 1 : Progression */}
            <Card className="premium-card-3d bg-white border-none p-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary"/> Évolution des scores
                </h3>
                <div className="h-64 w-full">
                    {scoreHistory.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} domain={[0, 100]} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{r: 6, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 2}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center flex-col text-slate-400">
                            <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest">Données insuffisantes</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* CHART 2 : Maîtrise par Thème (BarChart Horizontal pour clarté) */}
            <Card className="premium-card-3d bg-white border-none p-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600"/> Maîtrise par thématique
                </h3>
                <div className="h-64 w-full">
                    {themeStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={themeStats} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800, fill: '#475569'}} width={90}/>
                                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(value: any) => [`${value}%`, 'Score Moyen']}/>
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {themeStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center flex-col text-slate-400">
                            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest">Entraînez-vous pour voir vos stats</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
