import json, re, time, urllib.request
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    raw = urllib.request.urlopen(req, timeout=20).read()
    return raw.decode('euc-kr', errors='replace')

CBIFF_CATEGORIES = {
    "2123": "리퀘스트시네마",
    "2124": "올데이시네마",
    "2125": "마스터톡",
    "2126": "블라인드시네마",
    "2127": "커비컬렉션",
    "2128": "취생몽사",
    "2129": "영화만들기 프로젝트",
}

DATES = ["2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]
BASE = "https://community.biff.kr/kor/addon/00000001/"

def scrape_schedules():
    schedules = []
    film_refs = {}  # m_idx -> {titleKo, categoryId}
    for d in DATES:
        html = fetch(f"{BASE}schedule_view.asp?QueryStep=1&QueryDate={d}")
        soup = BeautifulSoup(html, 'html.parser')
        table = soup.select_one('table.table05')
        if not table:
            continue
        date_str = f"{d[5:7]}-{d[8:10]}"
        for tr in table.select('tbody tr'):
            tds = tr.select('td')
            if len(tds) < 4:
                continue
            code_el = tr.select_one('span.txt-point01')
            time_el = tr.select_one('td.en')
            a = tr.select_one('a[href*="program_view"]')
            if not (code_el and time_el and a):
                continue
            m = re.search(r'm_idx=(\d+)', a.get('href', ''))
            c = re.search(r'c_idx=(\d+)', a.get('href', ''))
            if not (m and c):
                continue
            m_idx, c_idx = m.group(1), c.group(1)
            venue = tds[3].get_text(strip=True)
            title_ko = a.get_text(strip=True)
            film_refs[m_idx] = {"titleKo": title_ko, "categoryId": int(c_idx)}
            schedules.append({
                "film_id": int(m_idx) + 900000,  # 메인 상영작 id와 겹치지 않도록 오프셋
                "title_ko": title_ko,
                "title_en": "",
                "director": "",
                "category_id": int(c_idx),
                "code": f"C{code_el.get_text(strip=True)}",
                "date": date_str,
                "time": time_el.get_text(strip=True),
                "venue": venue,
            })
        time.sleep(0.3)
    return schedules, film_refs

def scrape_film_details(film_refs):
    films = {}
    for m_idx, ref in film_refs.items():
        c_idx = ref["categoryId"]
        url = f"{BASE}program_view.asp?c_idx={c_idx}&QueryYear=2026&QueryType=B&QueryStep=2&m_idx={m_idx}"
        try:
            html = fetch(url)
        except Exception as e:
            print("failed", m_idx, e)
            films[m_idx] = {}
            continue
        soup = BeautifulSoup(html, 'html.parser')
        director = ""
        director_label = soup.find('i', string='Director')
        if director_label:
            span = director_label.find_next_sibling('span')
            director = span.get_text(strip=True) if span else ""
        info = {}
        for dl in soup.select('.scr-wrap dl'):
            dt = dl.find('dt')
            dd = dl.find('dd')
            if dt and dd:
                info[dt.get_text(strip=True)] = dd.get_text(strip=True)
        films[m_idx] = {
            "director": director,
            "country": info.get("국가", ""),
            "year": info.get("제작연도", ""),
            "runtime": info.get("러닝타임", ""),
        }
        time.sleep(0.2)
    return films

if __name__ == "__main__":
    schedules, film_refs = scrape_schedules()
    print("schedules:", len(schedules), "unique films:", len(film_refs))
    details = scrape_film_details(film_refs)

    films_out = []
    for m_idx, ref in film_refs.items():
        d = details.get(m_idx, {})
        films_out.append({
            "id": int(m_idx) + 900000,
            "titleKo": ref["titleKo"],
            "titleEn": "",
            "categoryId": ref["categoryId"],
            "subCategoryId": None,
            "director": d.get("director", ""),
            "country": d.get("country", ""),
            "year": d.get("year", "2026"),
            "runtime": d.get("runtime", ""),
            "ageRating": "",
            "detailUrl": f"https://community.biff.kr/kor/addon/00000001/program_view.asp?c_idx={ref['categoryId']}&QueryYear=2026&QueryType=B&QueryStep=2&m_idx={m_idx}",
        })

    out_dir = "/tmp/claude-1000/-home-wonchang-projects-15-biff/aa09225b-025f-46e8-82f6-b1388cc7309d/scratchpad"
    json.dump(schedules, open(f"{out_dir}/cbiff_schedules.json", "w"), ensure_ascii=False, indent=2)
    json.dump({"categories": CBIFF_CATEGORIES, "films": films_out}, open(f"{out_dir}/cbiff_films.json", "w"), ensure_ascii=False, indent=2)
    print("done")
