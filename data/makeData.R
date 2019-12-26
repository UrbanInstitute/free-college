library(tidyverse)

data <- read_csv("source/best_output_final.csv")

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
         )
         ) %>%
  select(char_id, race, incomegroup, loan, public, freecollege, fpl, name = new_name, income, 
         currentFreeCollege, allFreeCollege, freeCollege400FPL, freeCollege400FPLPublic)

write_csv(final_dat, "final_data.csv")
