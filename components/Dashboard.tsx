
import React, { useEffect, useMemo, useState } from 'react';

import stage1ImageUrl from '../img/1.png';
import stage2ImageUrl from '../img/2.png';
import stage3ImageUrl from '../img/3.png';
import stage4ImageUrl from '../img/4.png';
import stage5ImageUrl from '../img/5.png';
import stage6ImageUrl from '../img/6.png';
import stage7ImageUrl from '../img/7.png';
import stage8ImageUrl from '../img/8.png';
import stage9ImageUrl from '../img/9.jpg';
import stage10ImageUrl from '../img/10.jpg';

interface StageData {
  id: string;
  stage: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  position: 'top' | 'bottom';
  dateRange: string;
}

type BemfaResponse = {
  code: number;
  message: string;
  data?: Array<{
    msg: string;
    time: string;
    unix: number;
  }>;
};

export type SensorReading = {
  value: number | null;
  time: string;
  unix: number | null;
};

export type SensorsState = {
  light: SensorReading;
  tem: SensorReading;
  hum: SensorReading;
  soil: SensorReading;
  water: SensorReading;
  lastError: string | null;
};

const BEMFA_UID = '7432041b992943a88a4fd59edaa02474';
const BEMFA_BASE_URL = 'https://apis.bemfa.com/va/getmsg';
const VIDEO_STREAM_URL = 'http://esp32.zy991.cn/stream';

const fetchBemfaLatest = async (topic: string): Promise<SensorReading> => {
  const url = `${BEMFA_BASE_URL}?uid=${encodeURIComponent(BEMFA_UID)}&topic=${encodeURIComponent(topic)}&type=1&num=1`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as BemfaResponse;
  const item = json.data?.[0];
  const num = item ? Number.parseFloat(item.msg) : Number.NaN;
  return {
    value: Number.isFinite(num) ? num : null,
    time: item?.time ?? '',
    unix: item?.unix ?? null
  };
};

const formatUpdateTime = (time: string) => {
  if (!time) return '未更新';
  const match = time.match(/\b(\d{2}):(\d{2})(?::\d{2})?\b/);
  if (!match) return `更新: ${time}`;
  return `更新: ${match[1]}:${match[2]}`;
};

const formatValue = (value: number | null, unit: string) => {
  if (value === null) return `--${unit}`;
  const fixed = Number.isInteger(value) ? `${value}` : value.toFixed(2);
  return `${fixed}${unit}`;
};

const temperatureStatus = (value: number | null) => {
  if (value === null) return '⚪ 未获取到数据';
  if (value < 18) return '🔵 偏低';
  if (value > 30) return '🔴 偏高';
  if (value < 22) return '🟡 略低';
  if (value > 26) return '🟡 略高';
  return '🟢 适宜范围 (22-26)';
};

const humidityStatus = (value: number | null) => {
  if (value === null) return '⚪ 未获取到数据';
  if (value < 30) return '🔴 偏低';
  if (value > 80) return '🔴 偏高';
  if (value < 40) return '🟡 略低';
  if (value > 70) return '🟡 略高';
  return '🟢 舒适范围 (40-70)';
};

const soilStatus = (value: number | null) => {
  if (value === null) return '⚪ 未获取到数据';
  if (value < 25) return '🔴 需补水';
  if (value > 80) return '🔴 过湿';
  if (value < 35) return '🟡 略干';
  if (value > 70) return '🟡 略湿';
  return '🟢 适宜范围';
};

const lightStatus = (value: number | null) => {
  if (value === null) return '⚪ 未获取到数据';
  if (value < 200) return '🔴 光照不足';
  if (value < 800) return '🟡 偏弱';
  if (value > 20000) return '🔴 过强';
  return '🟢 光照充足';
};

const STAGE_INTROS: Record<string, string> = {
  '1': '这一阶段是植物生命最关键的开端。种子在土壤中完成吸水、膨胀和发芽后，最先冒出的是幼芽顶端。因为仍处在地下环境向地面过渡的阶段，所以颜色往往偏白或浅黄，直到见光后才逐渐转为嫩绿。此时根系尚未完全展开，因此植株非常脆弱，抗逆性差，需要稳定湿度与温度的保护。这一时期标志着植物从“休眠的种子”真正进入生长轨道，开始依靠自身吸收水分和养分维持生命活动。任何强烈光照、干旱或碰撞都可能造成损伤，因此适合放在光线柔和、环境安静的位置，让它慢慢适应外界条件。',
  '2': '进入这一阶段后，幼芽已经完全突破土壤表面，两片子叶逐渐展开，看起来开始有了“植物”的样子。子叶是幼苗最初进行光合作用的器官，因此颜色明显转为嫩绿，说明正在吸收光能并开始制造养分。根系同时向下扎入土壤，以保证水分与营养的供给。这一阶段虽比萌芽期坚强一些，但仍较为娇嫩，如果光照过强容易晒伤，水分不足也会萎蔫。因此需要柔和散光与轻度湿润环境，而不能积水。这个时期是植物从依靠种子储存营养，向自主生长过渡的重要阶段，也是观察健康与否的关键节点。',
  '3': '随着时间推移，植物进入幼苗早期生长期，茎开始逐渐伸长，顶端出现新的叶芽，植株明显比之前更有“高度感”。此时光合作用能力增强，叶绿素含量提升，绿色变得清新而鲜亮。植物会主动向光方向生长，因此需要保证光照均匀，避免单侧见光导致偏倒或徒长。根系在这一阶段迅速扩展，吸收能力增强，但仍对水分变化较为敏感。适度通风有助于减少病害风险。可以说，这是植物“努力长个子”的时期，为后续发育打下基础，健康的苗态会让后面生长更顺利。',
  '4': '这一阶段里，植物的叶片数量明显增加，新叶一片接着一片生长出来，植株也变得更加挺直稳固。绿色逐渐加深，说明叶绿素含量提升，光合作用效率增强。根系发展更加完善，已能较好支撑地上部分生长。此时植物对环境稳定性的需求仍较高，需要规律浇水与良好通风。同时，充足但不过量的光照非常关键，既能促进营养积累，又能避免徒长。可以把这一时期看作从“幼苗”向“成株”的过渡阶段，植株逐步表现出成熟形态，是成长过程中十分重要的一环。',
  '5': '到了这一阶段，植物已经进入营养生长旺盛期。叶片变宽变大，数量进一步增多，整体株型逐渐定型，看上去已经非常健康、饱满。此时植物主要任务是积累营养，为即将到来的开花阶段做能量储备。根系已扎得较深，吸收能力强，对水分与养分的需求提升，但仍需避免过度施肥。良好的光照和稳定环境，会让叶片保持鲜亮而富有生机。这一时期是决定后续是否能够顺利开花、花朵品质是否优良的重要节点，因此需要精心养护，使其保持旺盛生命力。',
  '6': '当植物发育到一定成熟度后，顶端开始出现花苞，这就进入了孕蕾期。花苞最初较小，颜色不明显，但随着时间推进逐渐变得饱满厚实。这时候植物会将更多养分输送到花部，用于花瓣与花器官的形成，因此叶片可能略微变慢生长。环境稳定尤为重要，频繁搬动或强烈刺激可能导致花苞脱落。水分要适中，避免忽干忽湿。孕蕾期非常令人期待，因为它意味着植物从单纯的营养生长，转入生殖生长阶段，即将展现最美丽的一刻。',
  '7': '到了花苞成熟期，花朵的颜色在花苞表面已经清晰可见，外形饱满而富有张力，看上去随时会绽放。此时花瓣结构基本形成，只差最后一步展开。由于花苞内部组织较为娇嫩，环境波动、强光直晒或水分失衡，都容易对花造成影响。因此保持适度光照与通风，是保证花朵顺利开放的关键。这一阶段的植物非常优雅而宁静，像是在积蓄力量，即将带来视觉盛宴。可以说，这是“美丽的前奏”，也是观赏价值逐步提升的开始。',
  '8': '当花瓣开始向外舒展，植物便进入了初花期。此时花朵已经开放，但并未完全展开，整体形态仍略含羞涩，色彩正在逐渐加深。随着花朵张开，植物能量消耗会明显增加，因此需要保持适当水分与温度，以延长花期。强光直射和剧烈温差都可能缩短开花时间。初花期往往给人一种清新、柔和的美感，是许多人最喜欢观看的阶段，因为变化每天都很明显，仿佛在亲眼见证生命慢慢绽放。',
  '9': '盛花期是整个生长周期中观赏价值最高的阶段。此时花瓣已经完全舒展，花型饱满立体，颜色鲜艳而稳定，整体状态达到顶峰。植物将之前积累的大量养分用于维持花朵开放，因此适当补水和稳定环境尤为重要。盛花期不仅是视觉享受，也是植物向外传递成熟与生命力的象征。随着时间推移，花瓣最终会逐渐老化、凋谢，但这段盛放时刻，正是它一生中最耀眼的瞬间。',
  '10': '观赏成熟期意味着花朵保持稳定开放状态，整体姿态自然舒展，是长时间展示美感的阶段。虽然与盛花初期相比，变化已经不大，但依旧保持优雅与鲜艳。植物在这一时期整体生理状态趋于平衡，不再明显生长，而是以维持为主。适度补水与保持清洁环境，可以延长花朵寿命。观赏成熟期不仅是一段静态之美，也是生长旅程的收尾阶段，让人们能够沉浸欣赏植物带来的温柔与宁静。'
};

const GROWTH_STAGES_DATA: StageData[] = [
  {
    id: '1',
    stage: '第1阶段',
    title: '破土萌芽期',
    description: '刚钻出土表一点点。',
    imageUrl: stage1ImageUrl,
    color: '#86efac', 
    position: 'top',
    dateRange: '2025-10-29 ～ 10-31'
  },
  {
    id: '2',
    stage: '第2阶段',
    title: '发芽完成期',
    description: '两片子叶完全展开。',
    imageUrl: stage2ImageUrl,
    color: '#4ade80', 
    position: 'bottom',
    dateRange: '2025-11-01 ～ 11-04'
  },
  {
    id: '3',
    stage: '第3阶段',
    title: '幼苗生长期（早期）',
    description: '小苗刚站稳、顶端有新芽。',
    imageUrl: stage3ImageUrl,
    color: '#22c55e', 
    position: 'top',
    dateRange: '2025-11-05 ～ 11-09'
  },
  {
    id: '4',
    stage: '第4阶段',
    title: '幼苗生长期（中期）',
    description: '新叶持续长出、茎开始变粗。',
    imageUrl: stage4ImageUrl,
    color: '#16a34a', 
    position: 'bottom',
    dateRange: '2025-11-10 ～ 11-19'
  },
  {
    id: '5',
    stage: '第5阶段',
    title: '营养生长期',
    description: '叶片逐渐增多、株型稳定。',
    imageUrl: stage5ImageUrl,
    color: '#15803d', 
    position: 'top',
    dateRange: '2025-11-20 ～ 12-07'
  },
  {
    id: '6',
    stage: '第6阶段',
    title: '孕蕾期（含苞待放）',
    description: '花苞刚形成但未展开。',
    imageUrl: stage6ImageUrl,
    color: '#f9a8d4', 
    position: 'bottom',
    dateRange: '2025-12-08 ～ 12-13'
  },
  {
    id: '7',
    stage: '第7阶段',
    title: '花苞成熟期',
    description: '花苞已经显色，马上要开。',
    imageUrl: stage7ImageUrl,
    color: '#f472b6', 
    position: 'top',
    dateRange: '2025-12-14 ～ 12-19'
  },
  {
    id: '8',
    stage: '第8阶段',
    title: '初花期',
    description: '花朵刚开放，还没完全张开。',
    imageUrl: stage8ImageUrl,
    color: '#e879f9', 
    position: 'bottom',
    dateRange: '2025-12-20 ～ 12-23'
  },
  {
    id: '9',
    stage: '第9阶段',
    title: '盛花期',
    description: '花瓣舒展最饱满、最好看。',
    imageUrl: stage9ImageUrl,
    color: '#d946ef', 
    position: 'top',
    dateRange: '2025-12-24 ～ 12-26'
  },
  {
    id: '10',
    stage: '第10阶段',
    title: '观赏成熟期',
    description: '花朵完全展开、状态稳定。',
    imageUrl: stage10ImageUrl,
    color: '#c026d3', 
    position: 'bottom',
    dateRange: '2025-12-26'
  }
];

const StatCard: React.FC<{ icon: string; label: string; value: string; subValue: string; color: string }> = ({ icon, label, value, subValue, color }) => (
  <div className={`bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group hover:bg-white/10 transition-colors duration-300`}>
    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${color}-500/20 rounded-full blur-3xl group-hover:bg-${color}-500/30 transition-colors`}></div>
    
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
           <span className="text-xl filter drop-shadow-lg">{icon}</span>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
      </div>
      
      <div className="mt-1">
        <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums">
          {value}
        </div>
      </div>
      
      <div className={`text-[10px] font-bold mt-3 px-2 py-1 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-300 self-start inline-flex items-center gap-1.5`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400 ${color === 'emerald' ? '' : 'animate-pulse'}`}></span>
        {subValue}
      </div>
    </div>
  </div>
);

const StageListItem: React.FC<{ item: StageData; isLast: boolean; onSelect: (id: string) => void }> = ({ item, isLast, onSelect }) => {
  return (
    <button
      type="button"
      className="w-full text-left cursor-pointer block group hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 hover:shadow-2xl hover:-translate-y-0.5 relative overflow-hidden"
      onClick={() => onSelect(item.id)}
      aria-label={`${item.stage} ${item.title} 查看介绍`}
    >
      {/* 顶部装饰 */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] opacity-20 transition-transform group-hover:scale-110"
        style={{ background: `linear-gradient(to bottom left, ${item.color}, transparent)` }}
      ></div>

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
           <div
             className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
             style={{ backgroundColor: item.color }}
           ></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5">
             {item.stage}
           </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 font-mono">{item.dateRange.split('～')[0]}</span>
      </div>

      <div className="mb-3 relative z-10">
        <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors truncate pr-2">{item.title}</h3>
        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">{item.description}</p>
      </div>

      <div className="rounded-xl overflow-hidden h-24 w-full border border-white/5 bg-black/20 relative group-hover:shadow-inner transition-shadow">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/1e293b/475569?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
      </div>
    </button>
  );
};

type DashboardProps = {
  onSensorsChange?: (sensors: SensorsState) => void;
};

const Dashboard: React.FC<DashboardProps> = ({ onSensorsChange }) => {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [sensors, setSensors] = useState<SensorsState>({
    light: { value: null, time: '', unix: null },
    tem: { value: null, time: '', unix: null },
    hum: { value: null, time: '', unix: null },
    soil: { value: null, time: '', unix: null },
    water: { value: null, time: '', unix: null },
    lastError: null
  });
  const [isStreamEnabled, setIsStreamEnabled] = useState(true);
  const [streamRevision, setStreamRevision] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);
  const selectedStage = useMemo(
    () => GROWTH_STAGES_DATA.find((s) => s.id === selectedStageId) ?? null,
    [selectedStageId]
  );
  const selectedIntro = selectedStageId ? STAGE_INTROS[selectedStageId] : '';

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [light, tem, hum, soil, water] = await Promise.all([
          fetchBemfaLatest('light'),
          fetchBemfaLatest('tem'),
          fetchBemfaLatest('hum'),
          fetchBemfaLatest('soil'),
          fetchBemfaLatest('water')
        ]);
        if (cancelled) return;
        setSensors((prev) => ({
          ...prev,
          light,
          tem,
          hum,
          soil,
          water,
          lastError: null
        }));
      } catch (e) {
        if (cancelled) return;
        setSensors((prev) => ({
          ...prev,
          lastError: e instanceof Error ? e.message : String(e)
        }));
      }
    };

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    onSensorsChange?.(sensors);
  }, [onSensorsChange, sensors]);

  useEffect(() => {
    if (!selectedStageId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStageId(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStageId]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-900 text-slate-200">
      
      {/* 顶部标题区 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2 sm:mb-4 border-b border-slate-800 pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
             🌷 植物生长时间轴
             <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-full font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">郁金香 #3</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">实时环境与全周期生长监测系统</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左侧：环境数据卡片 (3列) */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <span className="w-1 h-6 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
            环境监测
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
            <StatCard
              icon="🌡️"
              label="空气温度"
              value={formatValue(sensors.tem.value, '°C')}
              subValue={`${temperatureStatus(sensors.tem.value)}`}
              color={sensors.tem.value === null ? 'amber' : sensors.tem.value < 18 || sensors.tem.value > 30 ? 'red' : 'emerald'}
            />
            <StatCard
              icon="💧"
              label="空气湿度"
              value={formatValue(sensors.hum.value, '%')}
              subValue={`${humidityStatus(sensors.hum.value)}`}
              color={sensors.hum.value === null ? 'amber' : sensors.hum.value < 30 || sensors.hum.value > 80 ? 'red' : 'emerald'}
            />
            <StatCard
              icon="🌱"
              label="土壤湿度"
              value={formatValue(sensors.soil.value, '%')}
              subValue={`${soilStatus(sensors.soil.value)}`}
              color={sensors.soil.value === null ? 'amber' : sensors.soil.value < 25 || sensors.soil.value > 80 ? 'red' : 'emerald'}
            />
            <StatCard
              icon="☀️"
              label="光照强度"
              value={formatValue(sensors.light.value, ' lx')}
              subValue={`${lightStatus(sensors.light.value)}`}
              color={sensors.light.value === null ? 'amber' : sensors.light.value < 200 || sensors.light.value > 20000 ? 'red' : 'emerald'}
            />
            <div className="col-span-2 sm:col-span-1">
              <StatCard
                icon="💦"
                label="水深"
                value={formatValue(sensors.water.value, ' cm')}
                subValue={sensors.lastError ? '接口异常' : '运行正常'}
                color={sensors.lastError ? 'red' : 'emerald'}
              />
            </div>
          </div>
        </div>

        {/* 右侧：监控与生长周期 (9列) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* 上：实时监控 */}
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"></span>
              实时监控
            </h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-1 relative overflow-hidden group shadow-2xl">
              {/* 装饰角标 */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl z-20"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl z-20"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-2xl z-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl z-20"></div>

              <div className="relative z-10 flex flex-col">
                 <div className="flex items-center justify-between px-4 py-3 bg-black/20 border-b border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isStreamEnabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`}></div>
                      <span className="text-sm font-bold text-slate-200 tracking-wide">CAM-01 主视角</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => { setStreamError(null); setStreamRevision(v => v + 1); setIsStreamEnabled(true); }}
                         className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                         title="刷新"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                       </button>
                       <a 
                         href={VIDEO_STREAM_URL} 
                         target="_blank" 
                         rel="noreferrer"
                         className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                         title="新窗口打开"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                       </a>
                    </div>
                 </div>
                 
                 <div className="bg-black/40 w-full flex items-center justify-center overflow-hidden rounded-b-[1.2rem]">
                   {isStreamEnabled ? (
                      <div className="relative w-full">
                        <div className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                          <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.05)_25%,rgba(6,182,212,0.05)_50%,transparent_50%,transparent_75%,rgba(6,182,212,0.05)_75%)] bg-[length:20px_20px]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent"></div>
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center relative z-10">
                              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-slate-900/50">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="text-white font-bold text-xl mb-1">实时视频监控</div>
                              <div className="text-cyan-400 text-sm font-mono">CAM-01 · ESP32-CAM</div>
                              <div className="text-slate-400 text-xs mt-2 flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                设备在线 · 1080P
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="4"/>
                                </svg>
                                <span className="text-xs text-white font-mono">LIVE</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs text-slate-300 font-mono">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <a
                              href={VIDEO_STREAM_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                              全屏观看
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/50">
                          <a
                            href={VIDEO_STREAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-emerald-500/10 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">主视角</span>
                          </a>
                          <a
                            href="http://esp32.zy991.cn/stream"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-cyan-500/10 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors">高清模式</span>
                          </a>
                          <a
                            href="http://esp32.zy991.cn/stream"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-2 p-3 bg-slate-800/50 hover:bg-purple-500/10 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-purple-400 transition-colors">横屏模式</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 text-slate-500">
                        <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        <span className="font-semibold">已暂停视频流</span>
                        <button onClick={() => setIsStreamEnabled(true)} className="text-emerald-500 hover:text-emerald-400 text-sm font-bold underline decoration-2 underline-offset-4">点击开启</button>
                      </div>
                    )}

                    {isStreamEnabled && streamError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                        <div className="text-center px-4">
                          <div className="text-emerald-500 mb-2">
                             <svg className="w-10 h-10 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                          <div className="text-sm font-black text-white">信号丢失</div>
                          <div className="text-xs text-slate-400 mt-1 mb-3">{streamError}</div>
                          <button
                            type="button"
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all"
                            onClick={() => {
                              setStreamError(null);
                              setStreamRevision((v) => v + 1);
                              setIsStreamEnabled(true);
                            }}
                          >
                            重试连接
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          {/* 下：生长周期 */}
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
              生长周期
            </h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 relative overflow-hidden shadow-xl">
               <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
               
               {/* Mobile: Horizontal Scroll, Desktop: Grid */}
               <div className="flex flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden">
                  {GROWTH_STAGES_DATA.map((item, index) => (
                    <div key={item.id} className="min-w-[20%] sm:min-w-0 snap-center sm:snap-align-none flex-shrink-0 sm:flex-shrink">
                      <StageListItem
                        item={item}
                        isLast={index === GROWTH_STAGES_DATA.length - 1}
                        onSelect={setSelectedStageId}
                      />
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>

      </div>

      {selectedStage && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStageId(null)}></div>
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-10">
            <div
              className="w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col sm:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full sm:w-1/2 h-64 sm:h-auto relative">
                 <img src={selectedStage.imageUrl} alt={selectedStage.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent sm:bg-gradient-to-r"></div>
              </div>
              
              <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col">
                 <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{selectedStage.stage}</div>
                      <h2 className="text-2xl font-black text-white">{selectedStage.title}</h2>
                      <div className="text-sm font-mono text-slate-400 mt-2">{selectedStage.dateRange}</div>
                    </div>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                      onClick={() => setSelectedStageId(null)}
                    >
                      ×
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-2 text-slate-300 leading-relaxed text-sm">
                   {selectedIntro || '暂无介绍内容。'}
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                    <button 
                      onClick={() => setSelectedStageId(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      关闭详情
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
