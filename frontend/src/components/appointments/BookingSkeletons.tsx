import { Card, CardContent } from '@components/ui/Card';

export const SpecialtySkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-slate-800">
                <CardContent className="p-6 flex flex-col items-center animate-pulse">
                    <div className="h-16 w-16 bg-slate-800 rounded-2xl mb-4" />
                    <div className="h-5 w-2/3 bg-slate-800 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-800 rounded" />
                </CardContent>
            </Card>
        ))}
    </div>
);

export const DoctorSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-slate-800">
                <CardContent className="p-5 animate-pulse">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-3/4 bg-slate-800 rounded" />
                            <div className="h-4 w-1/2 bg-slate-800 rounded" />
                            <div className="h-3 w-1/3 bg-slate-800 rounded mt-4" />
                            <div className="h-8 w-full bg-slate-800 rounded mt-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export const SlotSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <section>
            <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-800 rounded-xl" />
                ))}
            </div>
        </section>
        <section>
            <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-800 rounded-xl" />
                ))}
            </div>
        </section>
    </div>
);
