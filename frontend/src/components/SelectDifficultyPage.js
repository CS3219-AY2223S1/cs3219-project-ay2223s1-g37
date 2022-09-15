import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";

function SelectDifficultyPage() {
  const [difficulty, setDifficulty] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");

  const handleSelect = (event) => {
    setDifficulty(event.target.value);
  };

  const nextClicked = () => {
    if (difficulty === "") {
      setIsDialogOpen(true);
      setDialogTitle("Error");
      setDialogMsg("Please select a difficulty level to continue");
    } else {
      alert(difficulty);
    }
  };

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      width={"50%"}
      margin={"0px auto"}
      //   sx={{ backgroundColor: "green" }}
    >
      <Typography variant={"h3"} marginBottom={"2rem"}>
        Select your difficulty:
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="label">Difficulty</InputLabel>
        <Select
          labelId="label"
          id="select"
          label="Difficulty"
          value={difficulty}
          onChange={handleSelect}
        >
          <MenuItem value={"Easy"}>Easy</MenuItem>
          <MenuItem value={"Medium"}>Medium</MenuItem>
          <MenuItem value={"Hard"}>Hard</MenuItem>
        </Select>
      </FormControl>

      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"flex-end"}
        sx={{ marginTop: 5 }}
      >
        <Button variant={"outlined"} onClick={nextClicked}>
          Next
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SelectDifficultyPage;
