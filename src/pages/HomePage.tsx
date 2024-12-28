import React, { useState, useEffect } from 'react';
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

const ITEMS_PER_PAGE = 2;

const HomePage: React.FC = () => {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [isExpandedPrevious, setIsExpandedPrevious] = useState(false);
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

        // Then fetch the puzzles for the current page
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
        
        console.log('Fetched puzzles:', puzzles);
        
        if (puzzles) {
          setPuzzles(puzzles);
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
  }, [currentPage]); // Add currentPage as dependency

  const formatPuzzleDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM dd yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Daily Jumble Answers</h1>
            
            {puzzles.map((puzzle, index) => (
              <JumblePuzzle 
                key={puzzle.id}
                date={formatPuzzleDate(puzzle.date)}
                words={puzzle.jumble_words}
                caption={puzzle.caption}
                imageUrl={puzzle.image_url}
                solution={puzzle.solution}
                isExpanded={index === 0 || isExpandedPrevious}
                onToggle={index === 1 ? () => setIsExpandedPrevious(!isExpandedPrevious) : undefined}
              />
            ))}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer"
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