import requests, difflib
from bs4 import BeautifulSoup, NavigableString, Tag
import json

resp = requests.get(input("url of the page:\n"))
soup = BeautifulSoup(resp.content, 'html.parser')

days = ["mon","tue","wed","thu","fri"]
start_times = ["8:30", "10:25", "12:20", "14:15", "16.10", "18:30"]

ret = {"first_week":{"mon":[],"tue":[],"wed":[],"thu":[],"fri":[]},"second_week":{"mon":[],"tue":[],"wed":[],"thu":[],"fri":[]}}
weeks = soup.find_all(id=["ctl00_MainContent_FirstScheduleTable","ctl00_MainContent_SecondScheduleTable"])


for i, week_key in enumerate(ret.keys()):
	week = ret[week_key]
	contents = weeks[i].contents

	#skip first table row since it has day of the week definitions
	for j,lesson_time in enumerate(contents[2:]):
		if isinstance(lesson_time, NavigableString) or len(lesson_time.contents)==0:
			continue

		#skip first row, used for numbering lessons
		for k,day in enumerate(lesson_time.contents[2:]):
			if isinstance(day, NavigableString) or len(day.contents)==0:
				continue

			print(j)
			print(day)
			print("===============================================\n")

			lesson_template = {"lesson_time":start_times[j],"lesson_name":"", "teacher_name":"", "place":"", "type":""}

			lesson_template["lesson_name"] = day.contents[0].contents[0]['title']
			
			links = day.find_all('a') 
			if len(links)>2:
				lesson_template["teacher_name"] = links[1].contents[0]
				lesson_template["place"] = links[2].contents[0].split(" ")[0]
				try:
					lesson_template["type"] = links[2].contents[0].split(" ")[1]
				except Exception as e:
					pass
				
			week[days[k]].append(lesson_template)
print(json.dumps(ret, ensure_ascii=False))
