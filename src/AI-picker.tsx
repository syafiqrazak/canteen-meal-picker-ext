import React, { useEffect, useState } from 'react';
import './App.css';
import Select from '@atlaskit/select';
import Button from 'react-bootstrap/Button';
import TextArea from '@atlaskit/textarea';
import axios from 'axios';

interface Menu {
  menu: string;
  description: string;
}

function AIPicker() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [randomize, setRandomize] = useState<{ id: number; menu: string }[]>([]);
  const [displayedAnswer, setDisplayedAnswer] = useState<string>('');
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [prompt, setPrompt] = useState<string>();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs.length === 0 || !tabs[0].id) {
        console.error("No active tab found.");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: extractHtmlData
        },
        (results: any) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed: ", chrome.runtime.lastError);
            return;
          }

          if (results && results[0].result) {
            console.log(results[0].result);
            setMenus(results[0].result.menu);
          }
        }
      );
    });
  }, []);

  // const extractHtmlData = () => {
  //   const pageTitle = document.title;
  //   const allParagraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
  //   const menu = Array.from(document.querySelectorAll('h5.pb-2.text-lg.font-medium.leading-tight.text-blue-400'))
  //     .map(element => element.textContent);
  //   const description = Array.from(document.querySelectorAll('p.mt-2.mb-2.text-sm.text-gray-400'))
  //     .map(element => element.textContent);
  //   return { title: pageTitle, paragraphs: allParagraphs, menu: menu, description: description };
  // };

  const extractHtmlData = () => {
    const pageTitle = document.title;
    const allParagraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText);
    const menuElements = document.querySelectorAll('h5.pb-2.text-lg.font-medium.leading-tight.text-blue-400');
    const descriptionElements = document.querySelectorAll('p.mt-2.mb-2.text-sm.text-gray-400');

    const menu = Array.from(menuElements).map((element, index) => ({
      menu: element.textContent,
      description: descriptionElements[index] ? descriptionElements[index].textContent : null
    }));

    return { title: pageTitle, paragraphs: allParagraphs, menu };
  };

  const getAIResponse = async (): Promise<string[]> => {
    try {
      console.log(menus);
      // Extracting just the 'menu' names
      const menuNames = menus.map(item => item.menu);

      // Create the APPEND_END string properly
      const APPEND_END = `\n Below is the menu array. Please filter accordingly based on the above prompt. The result format must be the same 
                            as the menu array format.
                            Do not include any extra words or sentences, just return the filtered menu in this format: ['menu1', 'menu2', ...].
                            \n
                            ${JSON.stringify(menus)}`; // Use JSON.stringify to ensure the array format

      // Assuming 'prompt' is defined elsewhere, concatenate the result
      const newPrompt = prompt + APPEND_END;
      // console.log(newPrompt);
      // Prepare the data and config for the request
      const data = JSON.stringify({
        prompt: newPrompt
      });
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:3000/ai-engine/callAI/nonStream',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      // Make the API call using Axios
      const response = await axios.request(config);

      // Extract and return the API response data
      console.log("AI Response", JSON.stringify(response.data));
      const AIFilteredMenus: string[] = extractAIResponse(response.data);
      console.log("Filtered menus AI:")
      console.log(AIFilteredMenus);
      return AIFilteredMenus;

    } catch (error: any) {
      console.error("API call error:", error);
      return []; // Return an empty array if an error occurs
    }
  };

  // const extractAIResponse = (data: any): string[] => {
  //   // Assuming AI response contains a filtered menu array as expected
  //   if (data && Array.isArray(data.menus)) {
  //     return data.menus;
  //   }
  //   // Default fallback if response is unexpected
  //   return [];
  // };

  // const extractAIResponse = (text: string): string[] => {
  //   const extractedMenus: string[] = text
  //     .split('\n') // Split text into lines
  //     .filter((line: string) => line.startsWith('-')) // Filter only lines starting with '-'
  //     .map((line: string) => line.replace('- ', '').trim()); // Remove the '- ' prefix and trim spaces

  //   console.log(extractedMenus);
  //   return extractedMenus;
  // };

  const extractAIResponse = (text: string): string[] => {
    try {
      // Use a regular expression to find the array format in the response text
      const match = text.match(/(\[.*?\])/);

      if (match && match[1]) {
        // Replace single quotes with double quotes for valid JSON format
        const jsonString = match[1].replace(/'/g, '"');
        // Parse the matched string to extract the array of menus
        const menuArray = JSON.parse(jsonString);
        return menuArray;
      } else {
        console.error("Failed to extract menu array: No valid match found");
        return [];
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return [];
    }
  };


  // const extractAIResponse = (text: string): string[] => {
  //   try {
  //     // Use a regular expression to extract the JSON part of the string
  //     const jsonStringMatch = text.match(/\[.*\]/);

  //     if (!jsonStringMatch) {
  //       console.error('No valid JSON found in the response.');
  //       return []; // Return an empty array if no valid JSON is found
  //     }

  //     const jsonString = jsonStringMatch[0]; // Extract the matched JSON string

  //     // Parse the extracted JSON string
  //     const parsedMenus = JSON.parse(jsonString);

  //     // Ensure it's an array and extract the 'menu' field from each object
  //     const extractedMenus: string[] = parsedMenus.map((item: any) => item.menu);

  //     console.log(extractedMenus);
  //     return extractedMenus;
  //   } catch (error) {
  //     console.error('Failed to parse AI response:', error);
  //     return []; // Return empty array in case of an error
  //   }
  // };  

  const randomPick = async () => {
    const randomMenus = await getAIResponse();
    if (randomMenus.length === 0) return;

    const correctIndex = Math.floor(Math.random() * randomMenus.length);
    const correctAnswer = randomMenus[correctIndex];

    setJackpotAnimation(true);
    let falseAnswers = [...randomMenus];

    // Simulate rolling effect
    const interval = setInterval(() => {
      if (falseAnswers.length === 0) {
        clearInterval(interval);
        setTimeout(() => {
          setDisplayedAnswer(correctAnswer);
          setJackpotAnimation(false);
        }, 300); // Delay before showing the correct answer
      } else {
        const randomFalseIndex = Math.floor(Math.random() * falseAnswers.length);
        setDisplayedAnswer(falseAnswers[randomFalseIndex]);
        falseAnswers.splice(randomFalseIndex, 1); // Remove shown answer
      }
    }, 300); // Change the answer every 300ms
  };

  return (
    <div className="App">
      <h3>Next-Gen Canteen Random Meal Picker</h3>

      <TextArea
        id="area"
        resize="auto"
        maxHeight="20vh"
        name="area"
        defaultValue=""
        onChange={(e) => setPrompt(e.target.value)}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />

      <br />
      <Button as="input" type="button" value="Prompt and Pick My Meal" onClick={randomPick} />
      <br />

      <div className="answer-container">
        <div className={`jackpot ${jackpotAnimation ? 'jackpot-animation' : ''}`}>
          <p className={`answer ${jackpotAnimation ? 'fade-in' : ''}`}>{displayedAnswer}</p>
        </div>
      </div>
    </div>
  );
}

export default AIPicker;
