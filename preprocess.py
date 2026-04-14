#!/usr/bin/env python3
"""
Preprocess Jan_2019_ontime.csv → public/data.json
Run once before starting the React dev server.
"""
import json
import os
import time
from pathlib import Path
import pandas as pd

CSV_PATH = Path(__file__).parent.parent / "Jan_2019_ontime.csv"
OUT_PATH = Path(__file__).parent / "public" / "data.json"

CITY_NAMES = {
    'ATL':'Atlanta','LAX':'Los Angeles','ORD':"Chicago O'Hare",'DFW':'Dallas–Fort Worth',
    'DEN':'Denver','JFK':'New York JFK','SFO':'San Francisco','SEA':'Seattle',
    'LAS':'Las Vegas','MCO':'Orlando','MIA':'Miami','PHX':'Phoenix',
    'EWR':'Newark','MSP':'Minneapolis','BOS':'Boston','DTW':'Detroit',
    'CLT':'Charlotte','LGA':'New York LaGuardia','PHL':'Philadelphia',
    'IAH':'Houston','SLC':'Salt Lake City','PDX':'Portland','TPA':'Tampa',
    'MDW':'Chicago Midway','BWI':'Baltimore','IAD':'Washington Dulles',
    'DCA':'Washington Reagan','MSY':'New Orleans','STL':'St. Louis','MEM':'Memphis',
    'CVG':'Cincinnati','DAY':'Dayton','GNV':'Gainesville','TLH':'Tallahassee',
    'JAX':'Jacksonville','JAN':'Jackson MS','FSM':'Fort Smith',
    'RDU':'Raleigh-Durham','CLE':'Cleveland','CMH':'Columbus','IND':'Indianapolis',
    'MKE':'Milwaukee','OAK':'Oakland','SAN':'San Diego','SMF':'Sacramento',
    'HOU':'Houston Hobby','AUS':'Austin','SAT':'San Antonio','ABQ':'Albuquerque',
    'ELP':'El Paso','OGG':'Maui','KOA':'Kona','LIH':'Lihue',
    'HNL':'Honolulu','ANC':'Anchorage',
}

DAY_LABELS = {1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat',7:'Sun'}

USECOLS = [
    'DAY_OF_MONTH','DAY_OF_WEEK','OP_CARRIER',
    'ORIGIN','DEST','DEP_DEL15','ARR_DEL15',
    'CANCELLED','DIVERTED','DISTANCE','DEP_TIME_BLK',
]

CARRIER_NAMES = {
    'AA':'American','DL':'Delta','UA':'United','WN':'Southwest',
    'B6':'JetBlue','AS':'Alaska','NK':'Spirit','F9':'Frontier',
    'G4':'Allegiant','SY':'Sun Country','HA':'Hawaiian',
    '9E':'Endeavor Air','OO':'SkyWest','YX':'Republic','MQ':'Envoy',
    'OH':'PSA','YV':'Mesa','PT':'Southern','QX':'Horizon','ZW':'Air Wisconsin',
}

def short_block_label(block):
    try:
        hour = int(str(block)[:2])
        if hour == 0: return '12am'
        elif hour < 12: return f'{hour}am'
        elif hour == 12: return '12pm'
        else: return f'{hour-12}pm'
    except: return block

def r(val):
    return round(float(val), 2)

def main():
    t0 = time.time()
    print(f'Reading {CSV_PATH} ...')
    df = pd.read_csv(CSV_PATH, usecols=USECOLS)
    print(f'  Loaded {len(df):,} rows in {time.time()-t0:.1f}s')

    for col in ['DEP_DEL15','ARR_DEL15','CANCELLED','DIVERTED','DISTANCE']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    total = len(df)
    nc_mask = df['CANCELLED'] == 0
    on_time_mask = (df['DEP_DEL15']==0)&(df['ARR_DEL15']==0)&(df['CANCELLED']==0)

    # --- KPIs ---
    kpis = {
        'total_flights': total,
        'on_time_pct': r(on_time_mask.sum() / total * 100),
        'dep_delay_pct': r(df.loc[nc_mask,'DEP_DEL15'].mean()*100),
        'arr_delay_pct': r(df.loc[nc_mask,'ARR_DEL15'].mean()*100),
        'cancellation_pct': r(df['CANCELLED'].mean()*100),
        'diverted_pct': r(df['DIVERTED'].mean()*100),
        'avg_distance_miles': r(df['DISTANCE'].mean()),
        'total_airports': int(df['ORIGIN'].nunique()),
        'total_routes': int(df.groupby(['ORIGIN','DEST']).ngroups),
        'total_carriers': int(df['OP_CARRIER'].nunique()),
    }

    # --- Top origin airports ---
    orig_grp = df.groupby('ORIGIN')
    top_origins = []
    for airport, grp in orig_grp:
        nc = grp['CANCELLED'] == 0
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        top_dest = grp['DEST'].value_counts().index[0] if len(grp)>0 else ''
        top_origins.append({
            'airport': airport,
            'city': CITY_NAMES.get(airport, airport),
            'departures': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
            'dep_delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'cancellation_pct': r(grp['CANCELLED'].mean()*100),
            'top_dest': top_dest,
            'top_dest_city': CITY_NAMES.get(top_dest, top_dest),
        })
    top_origins = sorted(top_origins, key=lambda x: x['departures'], reverse=True)[:20]

    # --- Top destination airports ---
    dest_grp = df.groupby('DEST')
    top_dests = []
    for airport, grp in dest_grp:
        nc = grp['CANCELLED'] == 0
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        top_dests.append({
            'airport': airport,
            'city': CITY_NAMES.get(airport, airport),
            'arrivals': int(len(grp)),
            'arr_delay_pct': r(grp.loc[nc,'ARR_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'on_time_pct': r(otm.mean()*100),
        })
    top_dests = sorted(top_dests, key=lambda x: x['arrivals'], reverse=True)[:20]

    # --- By carrier ---
    carrier_grp = df.groupby('OP_CARRIER')
    by_carrier = []
    for carrier, grp in carrier_grp:
        nc = grp['CANCELLED'] == 0
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        by_carrier.append({
            'carrier': carrier,
            'name': CARRIER_NAMES.get(carrier, carrier),
            'total': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
            'dep_delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'arr_delay_pct': r(grp.loc[nc,'ARR_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'cancelled': int(grp['CANCELLED'].sum()),
            'cancellation_pct': r(grp['CANCELLED'].mean()*100),
        })
    by_carrier.sort(key=lambda x: x['on_time_pct'], reverse=True)

    # --- By day of week ---
    dow_grp = df.groupby('DAY_OF_WEEK')
    by_day_of_week = []
    for dn, grp in dow_grp:
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        nc = grp['CANCELLED']==0
        by_day_of_week.append({
            'day': DAY_LABELS.get(int(dn), str(dn)),
            'day_num': int(dn),
            'total': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
            'dep_delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
        })
    by_day_of_week.sort(key=lambda x: x['day_num'])

    # --- By day of month ---
    dom_grp = df.groupby('DAY_OF_MONTH')
    by_day_of_month = []
    for day, grp in dom_grp:
        nc = grp['CANCELLED']==0
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        by_day_of_month.append({
            'day': int(day),
            'total': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
            'dep_delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'cancelled': int(grp['CANCELLED'].sum()),
        })
    by_day_of_month.sort(key=lambda x: x['day'])

    # --- By time block ---
    block_grp = df.groupby('DEP_TIME_BLK')
    by_time_block = []
    for block, grp in block_grp:
        if str(block).startswith('0001') or str(block).startswith('2400'):
            continue
        nc = grp['CANCELLED']==0
        by_time_block.append({
            'block': str(block),
            'label': short_block_label(str(block)),
            'total': int(len(grp)),
            'delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
        })
    by_time_block.sort(key=lambda x: x['block'])

    # --- By distance bucket ---
    bins=[0,250,500,1000,2000,99999]
    labels=['0–250 mi','251–500 mi','501–1,000 mi','1,001–2,000 mi','2,000+ mi']
    df['dist_bucket'] = pd.cut(df['DISTANCE'], bins=bins, labels=labels)
    dist_grp = df.groupby('dist_bucket', observed=True)
    by_distance_bucket = []
    for bl, grp in dist_grp:
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        by_distance_bucket.append({
            'label': str(bl),
            'total': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
        })

    # --- Cancellation by carrier ---
    cancellation_by_carrier = sorted(
        [{'carrier': c['carrier'], 'name': c['name'], 'cancellation_pct': c['cancellation_pct']} for c in by_carrier],
        key=lambda x: x['cancellation_pct'], reverse=True
    )

    # --- Top routes ---
    route_grp = df.groupby(['ORIGIN','DEST'])
    routes = []
    for (origin, dest), grp in route_grp:
        otm = (grp['DEP_DEL15']==0)&(grp['ARR_DEL15']==0)&(grp['CANCELLED']==0)
        nc = grp['CANCELLED']==0
        routes.append({
            'route': f'{origin}→{dest}',
            'origin': origin,
            'origin_city': CITY_NAMES.get(origin, origin),
            'dest': dest,
            'dest_city': CITY_NAMES.get(dest, dest),
            'total': int(len(grp)),
            'on_time_pct': r(otm.mean()*100),
            'dep_delay_pct': r(grp.loc[nc,'DEP_DEL15'].mean()*100) if nc.sum()>0 else 0,
            'avg_distance': r(grp['DISTANCE'].mean()),
        })
    top_routes = sorted(routes, key=lambda x: x['total'], reverse=True)[:20]

    # --- Delay cascade ---
    dep_d = df['DEP_DEL15']==1
    arr_d = df['ARR_DEL15']==1
    canc = df['CANCELLED']==1
    divt = df['DIVERTED']==1
    delay_cascade = {
        'on_time': int(on_time_mask.sum()),
        'dep_delayed_only': int((dep_d & ~arr_d & ~canc).sum()),
        'arr_delayed_only': int((~dep_d & arr_d & ~canc).sum()),
        'both_delayed': int((dep_d & arr_d & ~canc).sum()),
        'cancelled': int(canc.sum()),
        'diverted': int(divt.sum()),
    }

    out = {
        'meta': {'source':'Jan_2019_ontime.csv','total_rows_processed':total},
        'kpis': kpis,
        'top_origins': top_origins,
        'top_dests': top_dests,
        'by_carrier': by_carrier,
        'by_day_of_week': by_day_of_week,
        'by_day_of_month': by_day_of_month,
        'by_time_block': by_time_block,
        'by_distance_bucket': by_distance_bucket,
        'cancellation_by_carrier': cancellation_by_carrier,
        'top_routes': top_routes,
        'delay_cascade': delay_cascade,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH,'w') as f:
        json.dump(out, f, separators=(',',':'))

    size_kb = os.path.getsize(OUT_PATH)/1024
    print(f'  Written → {OUT_PATH} ({size_kb:.1f} KB) in {time.time()-t0:.1f}s')
    print(f'  KPIs: {kpis}')
    print(f'  Top origins: {[a["airport"] for a in top_origins[:5]]}')
    print(f'  Top routes: {[r["route"] for r in top_routes[:5]]}')

if __name__ == '__main__':
    main()
