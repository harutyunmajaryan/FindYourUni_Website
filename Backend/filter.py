import pandas as pd
from thefuzz import process, fuzz

def GetFuzzyCourseNames(search_term, dataset, score_cutoff=70):
    matches = process.extractBests(
        search_term, 
        dataset["COURSE_NAME"].unique(), 
        scorer=fuzz.partial_token_set_ratio, 
        score_cutoff=score_cutoff
    )
    return [m[0] for m in matches]

def GetFuzzyLocationNames(search_term, dataset, score_cutoff=70):
    """
    This is for the frontend dropdown list for course locations
    """
    cities = dataset["CITY"].dropna().unique().tolist()
    regions = dataset["Region"].dropna().unique().tolist()
    country_names = ["England", "Wales", "Scotland", "Northern Ireland"]
    all_locations = list(set(cities + regions + country_names))

    matches = process.extractBests(
        search_term, 
        all_locations, 
        scorer=fuzz.partial_token_set_ratio, 
        score_cutoff=score_cutoff
    )
    
    return [m[0] for m in matches]

def GetFuzzyUniversityNames(search_term, dataset, score_cutoff=70):
    """
    This is for the frontend dropdown list for universities
    """
    universities = dataset["UNIVERSITY_NAME"].dropna().unique().tolist()

    matches = process.extractBests(
        search_term, 
        universities, 
        scorer=fuzz.partial_token_set_ratio, 
        score_cutoff=score_cutoff
    )
    
    return [m[0] for m in matches]

def GetFuzzyCategoryNames(search_term, dataset, score_cutoff=70):
    """
    This is for the frontend dropdown list for course catgory names
    """
    categories = dataset["BROAD_SUBJECT"].dropna().unique().tolist()

    matches = process.extractBests(
        search_term,
        categories,
        scorer=fuzz.partial_token_set_ratio,
        score_cutoff=score_cutoff
    )

    return [m[0] for m in matches]

def LocationFilter(location_list, dataset):
    country_codes = []
    for location in location_list:
        if location == "England":
            country_codes.append("XF")
        elif location == "Wales":
            country_codes.append("XI")
        elif location == "Northern Ireland":
            country_codes.append("XG")
        elif location == "Scotland":
            country_codes.append("XH")
    
    if not location_list:
        return dataset
    else:
        dataset = dataset[
            (dataset['Region'].isin(location_list)) |
            (dataset["CITY"].isin(location_list)) |
            (dataset["COUNTRY_CODE"].isin(country_codes))
        ]
        return dataset

def CategoryFilter(category_list, dataset):
    if not category_list:
        return dataset
    else:
        dataset = dataset[dataset['BROAD_SUBJECT'].isin(category_list)]
        return dataset

def NameFilter(name_list, dataset):
    if not name_list:
        return dataset
    else:
        all_matched_names = []
        for name in name_list:
            matched_names = GetFuzzyCourseNames(name, dataset)
            all_matched_names.extend(matched_names)
    
        all_matched_names = list(set(all_matched_names))
        dataset = dataset[dataset['COURSE_NAME'].isin(all_matched_names)]
        return dataset

def UniversityFilter(university_list, dataset):
    if not university_list:
        return dataset
    else:
        dataset = dataset[dataset['UNIVERSITY_NAME'].isin(university_list)]
        return dataset

def CourseTypeFilter(degree_type_list, dataset):
    if not degree_type_list:
        return dataset
    else:
        dataset = dataset[dataset['DEGREE_TYPE'].isin(degree_type_list)]
        return dataset

def GradesFilter(grades_list, grades_type, dataset):

    a_levels = {"A*": 56,"a*":56, "A": 48,"a":48, "B": 40,"b":40, "C": 32,"c":32, "D": 24,"d":24, "E": 16,"e":16,"U": 0,"F":0}
    ib = {"7": 56, "6": 48, "5": 32, "4": 24, "3": 12, "2": 0, "1": 0}

    total_ucas = 0

    if not grades_list:
        return dataset
    if not grades_type:
        return dataset

    else:
       if grades_type == "A-levels":
           for grade in grades_list:
               if grade in a_levels:
                   total_ucas += a_levels[grade]
               else:
                   continue

       elif grades_type == "IB":
           for grade in grades_list:
               if grade in ib:
                   total_ucas += ib[grade]
               else:
                   continue

    dataset = dataset[dataset['AVERAGE_TARIFF'] <= total_ucas]
    return dataset

def EntireFilter(location_list, category_list, name_list, degree_type_list, university_list, grades_list, grades_type, csv_path='master_dataset_v2.4.csv'):
    dataset = pd.read_csv(csv_path)
    filtered1 = LocationFilter(location_list, dataset)
    filtered2 = CategoryFilter(category_list, filtered1)
    filtered3 = NameFilter(name_list, filtered2)
    filtered4 = CourseTypeFilter(degree_type_list, filtered3)
    filtered5 = UniversityFilter(university_list, filtered4)
    filtered_dataset = GradesFilter(grades_list, grades_type, filtered5)
    return filtered_dataset


if __name__ == '__main__':
    location_list = []
    category_list = []
    name_list = []
    degree_type_list = []
    grades = []
    grades_type = "ALevel"
    df = pd.read_csv('master_dataset_v2.4.csv')
    filtered_dataset = EntireFilter(location_list, category_list, name_list, degree_type_list, grades, grades_type, df)
