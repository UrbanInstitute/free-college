library(tidyverse)

data <- read_csv("source/best_output_final.csv")

# randomly pick some students who switch to public schools after granting free college to 
# those below 400% of FPL and attend public institutions
# (must include Justina)
studentsWhoSwitch <- c(47, 59, 117, 128, 139)

# generate final dataset
final_dat <- data %>%
  mutate(currentFreeCollege = ifelse(freecollege == "not free", "no", "yes"),
         allFreeCollege = "yes",
         freeCollege400FPL = case_when(
           currentFreeCollege == "yes" ~ "yes",
           currentFreeCollege == "no" & fpl == "400%" ~ "no",
           currentFreeCollege == "no" & fpl != "400%" ~ "yes"
         ),
         freeCollege400FPLPublic = case_when(
           currentFreeCollege == "yes" ~ "yes",
           currentFreeCollege == "no" & fpl == "400%" ~ "no",
           currentFreeCollege == "no" & public == "not 2/4 yr pub" ~ "no",
           currentFreeCollege == "no" & fpl != "400%" & public == "2/4 yr pub" ~ "yes"
         ),
         switchToPublic = ifelse(freeCollege400FPLPublic == "yes" | char_id %in% studentsWhoSwitch, "yes", "no")
         ) %>%
  select(char_id, race, incomegroup, loan, public, freecollege, fpl, name = new_name, income, 
         currentFreeCollege, allFreeCollege, freeCollege400FPL, freeCollege400FPLPublic, switchToPublic)

final_dat2 <- final_dat %>%
  mutate(race2 = case_when(
    race == "Black or African American" ~ "Black",
    race == "Hispanic or Latino" ~ "Latino",
    race == "American Indian or Alaka Native, Native Hawaiian/other Pacific Islanders, or more than one race" ~ "Other race or ethnicity",
    TRUE ~ race 
  ),
  incomegroup_tooltip = case_when(
    str_detect(incomegroup, "Dep") & (fpl == "400%") ~ "Dependent (>400% federal poverty level)",
    str_detect(incomegroup, "Dep") & (fpl == "200%-400%") ~ "Dependent (200%–400% federal poverty level)",
    str_detect(incomegroup, "Dep") & (fpl == "<200%") ~ "Dependent (<200% federal poverty level)",
    str_detect(incomegroup, "Ind") & (fpl == "400%") ~ "Independent (>400% federal poverty level)",
    str_detect(incomegroup, "Ind") & (fpl == "200%-400%") ~ "Independent (200%–400% federal poverty level)",
    str_detect(incomegroup, "Ind") & (fpl == "<200%") ~ "Independent (<200% federal poverty level)"
  ), 
  incomegroup2 = case_when(
    incomegroup == "Dep+80k" ~ "Higher-income dependent (more than $80,000)",
    incomegroup == "Dep40k-80k" ~ "Middle-income dependent ($40,001 to $80,000)",
    incomegroup == "Dep<=40k" ~ "Lower-income dependent (up to $40,000)",
    incomegroup == "Ind+30k" ~ "Higher-income independent (more than $30,000)",
    incomegroup == "Ind15k-30k" ~ "Middle-income independent ($15,001 to $30,000)",
    incomegroup == "Ind<=15k" ~ "Lower-income independent (up to $15,000)"
  ),
  loan2 = case_when(loan == "no loans" ~ "Students without loans",
                    loan == "loans" ~ "Students with loans"),
  loan_tooltip = case_when(loan == "no loans" ~ "Does not have student loans",
                    loan == "loans" ~ "Has student loans"),
  sector = case_when(public == "2/4 yr pub" ~ "Public institution",
                     public == "not 2/4 yr pub" ~ "Private institution")
  ) %>%
  select(char_id, race2, incomegroup_tooltip, incomegroup2, loan_tooltip, loan2, sector, freecollege, fpl, name,
         income, currentFreeCollege, allFreeCollege, freeCollege400FPL, freeCollege400FPLPublic, switchToPublic) %>%
  rename(race = race2, loan = loan2, incomegroup = incomegroup2, orig_id = char_id) %>%
  mutate(char_id = row_number())

write_csv(final_dat2, "final_data.csv")
