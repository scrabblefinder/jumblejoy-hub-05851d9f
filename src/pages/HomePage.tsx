import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';
import { supabase } from '../integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 5;
import MetaTags from '../components/MetaTags';

const HomePage: React.FC = () => {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [expandedPuzzles, setExpandedPuzzles] = useState<{ [key: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        // First, get the total count of puzzles
        const { count } = await supabase
          .from('daily_puzzles')
          .select('*', { count: 'exact', head: true });

        if (count !== null) {
          setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        }

        // Then fetch the puzzles for the current page, ordered by date in descending order
        const { data: puzzles, error: puzzlesError } = await supabase
          .from('daily_puzzles')
          .select(`
            *,
            jumble_words (
              id,
              jumbled_word,
              answer
            )
          `)
          .order('date', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, (currentPage * ITEMS_PER_PAGE) - 1);

        if (puzzlesError) {
          console.error('Error fetching puzzles:', puzzlesError);
          toast({
            title: "Error",
            description: "Failed to load puzzles. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (puzzles) {
          setPuzzles(puzzles);
          // Initialize expanded state for all puzzles except the first one
          const newExpandedState = puzzles.reduce((acc, puzzle, index) => {
            acc[puzzle.id] = index === 0;
            return acc;
          }, {});
          setExpandedPuzzles(newExpandedState);
        }
      } catch (error) {
        console.error('Error fetching puzzles:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchPuzzles();
  }, [currentPage]);

  const formatPuzzleDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM dd yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatUrlDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const month = format(date, 'MMMM').toLowerCase();
      const day = format(date, 'dd');
      const year = format(date, 'yyyy');
      return `/daily-jumble-${month}-${day}-${year}-answers`;
    } catch (error) {
      console.error('Error formatting URL date:', error);
      return '#';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = (puzzleId: string) => {
    setExpandedPuzzles(prev => ({
      ...prev,
      [puzzleId]: !prev[puzzleId]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MetaTags 
        title="Daily Jumble Answers - JumbleAnswers.com"
        description="Here you may find all the latest daily jumble answers and solutions. Jumble is one of the most popular word games."
      />
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
            {puzzles.map((puzzle, index) => (
              <JumblePuzzle 
                key={puzzle.id}
                date={formatPuzzleDate(puzzle.date)}
                dateUrl={formatUrlDate(puzzle.date)}
                words={puzzle.jumble_words}
                caption={puzzle.caption}
                imageUrl={puzzle.image_url}
                solution={puzzle.solution}
                finalJumble={puzzle.final_jumble}
                isExpanded={expandedPuzzles[puzzle.id]}
                onToggle={index === 0 ? undefined : () => handleToggle(puzzle.id)}
              />
            ))}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="cursor-pointer hover:bg-gray-100"
                        />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer hover:bg-gray-100"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
