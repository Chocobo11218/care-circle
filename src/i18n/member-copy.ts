const seededCopy: Record<string, string> = {
  'Available during the task time': 'ว่างตลอดช่วงเวลากิจกรรม',
  'Available for most of the task time': 'ว่างเป็นส่วนใหญ่ในช่วงเวลากิจกรรม',
  'May be busy at the start time': 'อาจไม่ว่างในช่วงเริ่มกิจกรรม',
  'Free during the whole task time': 'ว่างตลอดช่วงเวลากิจกรรม',
  'Lives closest to the older adult': 'อยู่ใกล้ผู้สูงอายุมากที่สุด',
  'Has helped with similar tasks before': 'เคยช่วยดูแลกิจกรรมลักษณะนี้มาก่อน',
  'Free for most of the task time': 'ว่างเป็นส่วนใหญ่ในช่วงเวลากิจกรรม',
  'Lives a short distance away': 'อยู่ไม่ไกล',
  'Can travel by car': 'เดินทางด้วยรถยนต์ได้',
  'Free later in the task window': 'ว่างในช่วงท้ายของกิจกรรม',
  'Lives further away': 'อยู่ไกลกว่าสมาชิกคนอื่น',
  'A good backup if others are unavailable': 'เป็นตัวเลือกสำรองเมื่อคนอื่นไม่สะดวก',
}

export function memberCopy(text: string, isMock: boolean): string {
  return isMock ? seededCopy[text] ?? text : text
}
