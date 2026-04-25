import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface ChartWidgetProps {
    title: string;
    type: 'area' | 'pie' | 'bar';
    data: any[];
    dataKey: string;
    nameKey?: string;
    colors?: string[];
    description?: string;
    icon?: React.ReactNode;
    height?: number;
}

const ChartWidget = ({
    title,
    type,
    data,
    dataKey,
    nameKey = 'name',
    colors = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    description,
    icon,
    height = 300
}: ChartWidgetProps) => {

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-200 text-xs font-semibold mb-1">{label}</p>
                    <p className="text-primary-400 text-sm font-bold">
                        {payload[0].value} {payload[0].name}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis
                            dataKey={nameKey}
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#0d9488"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey={dataKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            className="text-xs text-slate-300"
                        />
                    </PieChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis
                            dataKey={nameKey}
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#525252"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={dataKey} fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader title={title} description={description} icon={icon} />
            <CardContent>
                <div style={{ width: '100%', height: height }}>
                    <ResponsiveContainer>
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChartWidget;
